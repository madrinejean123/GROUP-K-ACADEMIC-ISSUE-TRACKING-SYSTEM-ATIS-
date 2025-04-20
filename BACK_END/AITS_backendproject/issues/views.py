from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Issues, CollegeRegister
from .serializers import (
    IssueCreateSerializer,
    IssueAssignSerializer,
    IssueStatusUpdateSerializer,
    IssueDetailSerializer,
)
from users.models import Lecturer
from .utils import send_notification_email
import logging

from django.core.exceptions import ValidationError
from django.http import FileResponse, Http404
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views import View

logger = logging.getLogger(__name__)


class CreateIssueView(generics.CreateAPIView):
    serializer_class = IssueCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        student = getattr(user, 'student', None)
        if not student:
            return Response(
                {"error": "Only students can create issues."},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            college_register = CollegeRegister.objects.get(college=student.college)
            instance = serializer.save(
                author=student,
                register=college_register,
                college=student.college,
                school=student.school,
                department=student.department,
            )
            send_notification_email(
                subject='New Issue Submitted',
                message=f"Issue #{instance.id} submitted by {user.get_full_name()}",
                recipient_email=college_register.user.notification_email
            )
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class CollegeRegisterAssignView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, issue_id):
        user = request.user
        if user.user_role != 'registrar':
            return Response({"error": "Only registrars can assign issues."},
                            status=status.HTTP_403_FORBIDDEN)

        try:
            issue = Issues.objects.get(id=issue_id, college=user.college)
        except Issues.DoesNotExist:
            return Response({"error": "Issue not found in your college."},
                            status=status.HTTP_404_NOT_FOUND)

        lecturer_id = request.data.get('lecturer_id')
        try:
            lecturer = Lecturer.objects.get(id=lecturer_id)
        except Lecturer.DoesNotExist:
            return Response({"error": "Invalid Lecturer ID."},
                            status=status.HTTP_400_BAD_REQUEST)

        issue.assigned_lecturer = lecturer
        issue.status = 'in_progress'
        issue.save()

        send_notification_email(
            subject='Issue Assigned to You',
            message=f'Issue #{issue.id} assigned by {user.get_full_name()}.',
            recipient_email=lecturer.user.notification_email
        )
        return Response({"message": f"Issue assigned to {lecturer.user.get_full_name()}."},
                        status=status.HTTP_200_OK)


class LecturerUpdateIssueStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, issue_id):
        user = request.user
        # ← using your plural 'lecturers'
        lecturer = getattr(user, 'lecturers', None)
        if not lecturer:
            return Response({"error": "Only lecturers can update issue status."},
                            status=status.HTTP_403_FORBIDDEN)

        try:
            issue = Issues.objects.get(
                id=issue_id,
                assigned_lecturer=lecturer
            )
        except Issues.DoesNotExist:
            return Response({"error": "Issue not found or not assigned to you."},
                            status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status not in ['resolved', 'rejected', 'in_progress']:
            return Response({"error": "Invalid status update."},
                            status=status.HTTP_400_BAD_REQUEST)

        issue.status = new_status
        issue.save()
        return Response({"message": f"Issue status updated to {new_status}."},
                        status=status.HTTP_200_OK)

    def put(self, request, issue_id):
        # alias so PUT no longer 405s
        return self.patch(request, issue_id)


class ListIssuesView(generics.ListAPIView):
    serializer_class = IssueDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_role == 'student' and hasattr(user, 'student'):
            return Issues.objects.filter(author=user.student)

        if user.user_role == 'registrar':
            return Issues.objects.filter(college=user.college)

        # ← also using plural here
        if hasattr(user, 'lecturers'):
            return Issues.objects.filter(assigned_lecturer__user=user)

        return Issues.objects.none()


class RetrieveIssueView(generics.RetrieveAPIView):
    queryset = Issues.objects.all()
    serializer_class = IssueDetailSerializer
    permission_classes = [permissions.IsAuthenticated]


class SecureFileDownloadView(LoginRequiredMixin, View):
    def get(self, request, issue_id):
        try:
            issue = Issues.objects.get(id=issue_id)
            user = request.user
            if not (
                issue.author.user == user or
                issue.assigned_lecturer.user == user or
                hasattr(user, 'collegeregister')
            ):
                raise PermissionError

            if not issue.attachment:
                raise Http404("No file attached")

            return FileResponse(
                issue.attachment.open(),
                filename=issue.attachment.name.split('/')[-1]
            )
        except (Issues.DoesNotExist, PermissionError):
            return Response({"error": "Not authorized to access this file."},
                            status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
