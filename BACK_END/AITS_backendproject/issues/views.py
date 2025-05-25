from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import UserRateThrottle
from rest_framework.decorators import throttle_classes
from django.core.exceptions import ValidationError
from django.http import FileResponse, Http404
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.db.models import prefetch_related_objects
from django.conf import settings

from .models import Issue
from .serializers import (
    IssueCreateSerializer,
    IssueAssignSerializer,
    IssueStatusUpdateSerializer,
    IssueDetailSerializer,
)
from users.models import CollegeRegister, Lecturer, Student

from .utils import send_notification_email
import logging
import os

logger = logging.getLogger(__name__)

# Throttle rates (requests/minute)
class IssueCreateThrottle(UserRateThrottle):
    rate = '10/minute'


class CreateIssueView(generics.CreateAPIView):
    serializer_class   = IssueCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes     = (MultiPartParser, FormParser)    # ← enable file uploads
    throttle_classes   = [IssueCreateThrottle]            # ← apply your throttle

    def create(self, request, *args, **kwargs):
        # Log exactly what arrived for debugging:
        logger.debug("CreateIssueView: request.data = %s", request.data)
        logger.debug("CreateIssueView: request.FILES = %s", request.FILES)
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        # No more generic except–catch here, so any validation errors bubble out
        instance = serializer.save()
        if instance.handled_by:
            send_notification_email(
                subject=f'New Issue #{instance.id}',
                message=(
                    f"Issue submitted by {instance.author.user.get_full_name()}\n"
                    f"Direct link: /issues/{instance.id}"
                ),
                recipient_email=instance.handled_by.user.notification_email
            )


@method_decorator(cache_page(30), name='dispatch')
class ListIssuesView(generics.ListAPIView):
    serializer_class   = IssueDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Issue.objects.select_related(
            'author__user',
            'assigned_lecturer__user',
            'handled_by__user'
        )
        if user.user_role == 'student':
            return qs.filter(author=user.student)
        elif user.user_role == 'registrar':
            return qs.filter(college=user.college)
        elif user.user_role == 'lecturer':
            return qs.filter(assigned_lecturer__user=user)
        return qs.none()


class CollegeRegisterAssignView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, issue_id):
        try:
            issue = Issue.objects.select_related(
                'assigned_lecturer__user',
                'author__user'
            ).get(id=issue_id)
            if request.user.user_role != 'registrar':
                return Response(
                    {"error": "Only registrars can assign issues."},
                    status=status.HTTP_403_FORBIDDEN
                )

            serializer = IssueAssignSerializer(
                issue,
                data=request.data,
                context={'request': request}
            )
            serializer.is_valid(raise_exception=True)
            updated_issue = serializer.save()

            if updated_issue.assigned_lecturer:
                send_notification_email(
                    subject=f'Issue #{issue.id} Assigned',
                    message=(
                        f"Assigned by {request.user.get_full_name()}\n"
                        f"Student: {issue.author.user.get_full_name()}\n"
                        f"Link: /issues/{issue.id}"
                    ),
                    recipient_email=updated_issue.assigned_lecturer.user.notification_email
                )

            return Response(
                IssueDetailSerializer(updated_issue, context={'request': request}).data,
                status=status.HTTP_200_OK
            )
        except Issue.DoesNotExist:
            return Response(
                {"error": "Issue not found."},
                status=status.HTTP_404_NOT_FOUND
            )


class LecturerUpdateIssueStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, issue_id):
        try:
            issue = Issue.objects.select_related(
                'author__user',
                'assigned_lecturer__user'
            ).get(id=issue_id)
            if request.user.user_role != 'lecturer':
                return Response(
                    {"error": "Only lecturers can update issue status."},
                    status=status.HTTP_403_FORBIDDEN
                )

            serializer = IssueStatusUpdateSerializer(
                issue,
                data=request.data,
                partial=True,
                context={'request': request}
            )
            serializer.is_valid(raise_exception=True)
            updated_issue = serializer.save()

            if updated_issue.status == 'resolved':
                send_notification_email(
                    subject=f'Issue #{issue.id} Resolved',
                    message=(
                        f"Your issue has been resolved by "
                        f"{request.user.get_full_name()}"
                    ),
                    recipient_email=updated_issue.author.user.notification_email
                )

            return Response(
                IssueDetailSerializer(updated_issue, context={'request': request}).data,
                status=status.HTTP_200_OK
            )
        except Issue.DoesNotExist:
            return Response(
                {"error": "Issue not found."},
                status=status.HTTP_404_NOT_FOUND
            )

    def put(self, request, issue_id):
        return self.patch(request, issue_id)


class RetrieveIssueView(generics.RetrieveAPIView):
    queryset           = Issue.objects.select_related(
        'author__user',
        'assigned_lecturer__user',
        'handled_by__user'
    )
    serializer_class   = IssueDetailSerializer
    permission_classes = [permissions.IsAuthenticated]


class SecureFileDownloadView(LoginRequiredMixin, View):
    def get(self, request, issue_id):
        try:
            issue = Issue.objects.select_related(
                'author__user',
                'assigned_lecturer__user'
            ).get(id=issue_id)
            if not (
                issue.author.user == request.user or
                (issue.assigned_lecturer and issue.assigned_lecturer.user == request.user) or
                request.user.user_role == 'registrar'
            ):
                raise PermissionError("Not authorized")

            if not issue.attachment:
                raise Http404("No attachment")

            return FileResponse(
                issue.attachment.open(),
                as_attachment=True,
                filename=os.path.basename(issue.attachment.name)
            )
        except (Issue.DoesNotExist, PermissionError):
            return Response(
                {"error": "Not authorized"},
                status=status.HTTP_403_FORBIDDEN
            )


class HealthCheckView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            Issue.objects.first()
            test_file = os.path.isfile(settings.MEDIA_ROOT + '/test.txt')
            return Response(
                {"status": "healthy",
                 "storage": "available" if test_file else "unavailable"},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"status": "unhealthy", "error": str(e)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
