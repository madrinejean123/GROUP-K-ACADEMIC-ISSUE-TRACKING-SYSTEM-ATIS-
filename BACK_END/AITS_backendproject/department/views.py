from rest_framework import viewsets, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import College, School, Department
from .serializers import CollegeSerializer, SchoolSerializer, DepartmentSerializer
from users.permissions import IsSuperAdmin

class CollegeViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = College.objects.all()
    serializer_class = CollegeSerializer


class CollegeSchoolsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request, college_id=None):
        college = get_object_or_404(College, id=college_id)
        schools = college.schools.all()
        serializer = SchoolSerializer(schools, many=True)
        return Response(serializer.data)


class SchoolDepartmentViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, school_id=None):
        school = get_object_or_404(School, id=school_id)
        departments = school.departments.all()
        serializer = DepartmentSerializer(departments, many=True)
        return Response(serializer.data)


class StudentCollegeViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        if hasattr(request.user, 'student'):
            college = request.user.student.college
            serializer = CollegeSerializer(college)
            return Response(serializer.data)
        return Response({'error': 'User is not a student'}, status=401)


class StudentSchoolViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        if hasattr(request.user, 'student'):
            school = request.user.student.department.school
            serializer = SchoolSerializer(school)
            return Response(serializer.data)
        return Response({'error': 'User is not a student'}, status=401)


class StudentDepartmentViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        if hasattr(request.user, 'student') and hasattr(request.user.student, 'department'):
            department = request.user.student.department
            serializer = DepartmentSerializer(department)
            return Response(serializer.data)
        return Response({'error': 'User is not a student'}, status=401)


class RegisterCollegeViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        if hasattr(request.user, 'register'):
            college = request.user.register.college
            serializer = CollegeSerializer(college)
            return Response(serializer.data)
        return Response({'error': 'User is not a registrar'}, status=401)


class LecturerCollegeViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        if hasattr(request.user, 'lecturer'):
            colleges = request.user.lecturer.college_set.all()
            serializer = CollegeSerializer(colleges, many=True)
            return Response(serializer.data)
        return Response({'error': 'User is not a lecturer'}, status=401)


# Admin views for creating colleges, schools, and departments
class CreateCollegeViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]
    serializer_class = CollegeSerializer

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class CreateSchoolViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]
    serializer_class = SchoolSerializer

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class CreateDepartmentViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]
    serializer_class = DepartmentSerializer

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
