from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Issues
from .serializers import (
    IssueCreateSerializer,
    IssueAssignSerializer,
    IssueStatusUpdateSerializer,
    IssueDetailSerializer,
)
from users.models import Lecturer
from .utils import send_notification_email
import logging

logger = logging.getLogger(__name__)


class CreateIssueView(generics.CreateAPIView):
    """
    Students create and submit issues.
    Issue is assigned to CollegeRegister automatically.
    """
    serializer_class = IssueCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        student = getattr(user, 'student', None)
        if not student:
            return Response({"error": "Only students can create issues."}, status=status.HTTP_403_FORBIDDEN)

        # find registrar for notification
        college_register = student.user.collegeregister if hasattr(student.user, 'collegeregister') else None
        serializer.save(
            author=student,
            register=college_register,
            college=student.college,
            school=student.school,
            department=student.department,
        )
        if college_register:
            send_notification_email(
                subject="New Student Issue Submitted",
                message=f"{student.user.get_full_name()} submitted a new issue.",
                recipient_email=college_register.user.notification_email
            )


class CollegeRegisterAssignView(APIView):
    """
    Registrar assigns an issue to a lecturer.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, issue_id):
        user = request.user
        # Check user role
        if user.user_role != 'registrar':
            return Response({"error": "Only registrars can assign issues."}, status=status.HTTP_403_FORBIDDEN)

        # Filter by user's college
        try:
            issue = Issues.objects.get(id=issue_id, college=user.college)
        except Issues.DoesNotExist:
            return Response({"error": "Issue not found in your college."}, status=status.HTTP_404_NOT_FOUND)

        lecturer_id = request.data.get('lecturer_id')
        try:
            lecturer = Lecturer.objects.get(id=lecturer_id)
        except Lecturer.DoesNotExist:
            return Response({"error": "Invalid Lecturer ID."}, status=status.HTTP_400_BAD_REQUEST)

        issue.assigned_lecturer = lecturer
        issue.status = 'in_progress'
        issue.save()

        success = send_notification_email(
            subject='Issue Assigned to You',
            message=f'Issue #{issue.id} assigned by {user.get_full_name()}.',
            recipient_email=lecturer.user.notification_email
        )
        if success:
            logger.info(f'Notified {lecturer.user.email}')
        else:
            logger.warning(f'Failed to notify {lecturer.user.email}')

        return Response({"message": f"Issue assigned to {lecturer.user.get_full_name()}."}, status=status.HTTP_200_OK)


class LecturerUpdateIssueStatusView(APIView):
    """
    Only lecturers can update the status of an issue.
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, issue_id):
        user = request.user
        lecturer = getattr(user, 'lecturer', None)
        if not lecturer:
            return Response({"error": "Only lecturers can update issue status."}, status=status.HTTP_403_FORBIDDEN)

        try:
            issue = Issues.objects.get(id=issue_id, assigned_lecturer=lecturer)
        except Issues.DoesNotExist:
            return Response({"error": "Issue not found or not assigned to you."}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status not in ['resolved', 'rejected', 'in_progress']:
            return Response({"error": "Invalid status update."}, status=status.HTTP_400_BAD_REQUEST)

        issue.status = new_status
        issue.save()
        return Response({"message": f"Issue status updated to {new_status}."}, status=status.HTTP_200_OK)


class ListIssuesView(generics.ListAPIView):
    """
    List issues based on user role:
    - Students: own issues
    - Registrars: issues in their college
    - Lecturers: assigned issues
    """
    serializer_class = IssueDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Student view
        if user.user_role == 'student' and hasattr(user, 'student'):
            return Issues.objects.filter(author=user.student)
        # Registrar view
        if user.user_role == 'registrar':
            return Issues.objects.filter(college=user.college)
        # Lecturer view
        if user.user_role == 'lecturer' and hasattr(user, 'lecturer'):
            return Issues.objects.filter(assigned_lecturer=user.lecturer)
        # Fallback
        return Issues.objects.none()


class RetrieveIssueView(generics.RetrieveAPIView):
    """
    Retrieve details of a specific issue.
    """
    queryset = Issues.objects.all()
    serializer_class = IssueDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
