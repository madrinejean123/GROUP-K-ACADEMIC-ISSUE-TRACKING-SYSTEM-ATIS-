from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Issues
from .serializers import IssueCreateSerializer, IssueAssignSerializer, IssueStatusUpdateSerializer, IssueDetailSerializer
from users.models import CollegeRegister, Lecturer

# 1️⃣ API for Students to Create an Issue
class CreateIssueView(generics.CreateAPIView):
    """
    Students create and submit issues.
    Issue is assigned to CollegeRegister automatically.
    """
    serializer_class = IssueCreateSerializer  # Corrected to IssueCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        student = getattr(user, 'student', None)  # Ensure user is a student
        if not student:
            return Response({"error": "Only students can create issues."}, status=status.HTTP_403_FORBIDDEN)

        # Assign issue to the CollegeRegister of the student's college
        college_register = CollegeRegister.objects.filter(college=student.college).first()
        if not college_register:
            return Response({"error": "No College Register found for your college."}, status=status.HTTP_400_BAD_REQUEST)

        serializer.save(
            author=student,
            college=student.college,
            school=student.school,
            department=student.department,
            register=college_register
        )

# 2️⃣ API for College Register to View & Assign Issues
class CollegeRegisterAssignView(APIView):
    """
    College Register assigns an issue to a lecturer.
    Only the College Register can perform this action.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, issue_id):
        user = request.user
        register = getattr(user, 'collegeregister', None)
        if not register:
            return Response({"error": "Only College Registers can assign issues."}, status=status.HTTP_403_FORBIDDEN)

        try:
            issue = Issues.objects.get(id=issue_id, register=register)
        except Issues.DoesNotExist:
            return Response({"error": "Issue not found or not assigned to you."}, status=status.HTTP_404_NOT_FOUND)

        lecturer_id = request.data.get('lecturer_id')
        try:
            lecturer = Lecturer.objects.get(id=lecturer_id)
        except Lecturer.DoesNotExist:
            return Response({"error": "Invalid Lecturer ID."}, status=status.HTTP_400_BAD_REQUEST)

        issue.assigned_lecturer = lecturer
        issue.save()
        return Response({"message": f"Issue assigned to {lecturer} successfully."}, status=status.HTTP_200_OK)

# 3️⃣ API for Lecturers to Update Issue Status
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

# 4️⃣ API to List Issues (For All Users)
class ListIssuesView(generics.ListAPIView):
    """
    List all issues. Different users see different issues:
    - Students see only their issues.
    - College Register sees issues in their college.
    - Lecturers see only assigned issues.
    """
    serializer_class = IssueDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'student'):
            return Issues.objects.filter(author=user.student)
        elif hasattr(user, 'collegeregister'):
            return Issues.objects.filter(college=user.collegeregister.college)
        elif hasattr(user, 'lecturer'):
            return Issues.objects.filter(assigned_lecturer=user.lecturer)
        return Issues.objects.none()  # Default to empty if user role is unknown

# 5️⃣ API to Retrieve a Specific Issue
class RetrieveIssueView(generics.RetrieveAPIView):
    """
    Retrieve details of a specific issue.
    """
    queryset = Issues.objects.all()
    serializer_class = IssueDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
