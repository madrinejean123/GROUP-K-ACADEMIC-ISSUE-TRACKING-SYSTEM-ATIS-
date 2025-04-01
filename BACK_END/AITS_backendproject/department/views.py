from django.shortcuts import render
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import College, School, Department
from .serializers import CollegeSerializer, SchoolSerializer, DepartmentSerializer


class CollegeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        colleges = College.objects.all()
        serializer = CollegeSerializer(colleges, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    
class CollegeSchoolsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, college_id):
        college = get_object_or_404(College, id=college_id)
        schools = college.schools.all()
        serializer = SchoolSerializer(schools, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    
class SchoolDepartmentView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, school_id):
        school = get_object_or_404(School, id=school_id)
        departments = school.departments.all()
        serializer = DepartmentSerializer(departments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class CreateCollegeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CollegeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    
class CreateSchoolView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, college_id):
        college = get_object_or_404(College, id=college_id)
        serializer = SchoolSerializer(data=request.data)
        if serializer.is_valid():
            serializer.validated_data['college']=college
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CreateDepartmentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, school_id):
        school = get_object_or_404(School, id=school_id)
        serializer = DepartmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.validated_data['school']=school
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
        


class StudentCollegeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if hasattr(request.user, 'student'):
            college = request.user.student.college
            serializer = CollegeSerializer(college)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'error': 'User is not a student'}, status=status.HTTP_401_UNAUTHORIZED)


class StudentSchoolView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if hasattr(request.user, 'student'):
            school = request.user.student.department.school
            serializer = SchoolSerializer(school)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'error': 'User is not a student'}, status=status.HTTP_401_UNAUTHORIZED)


class StudentDepartmentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if hasattr(request.user, 'student') and hasattr(request.user.student, 'department'):
            department = request.user.student.department
            serializer = DepartmentSerializer(department)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'error': 'User is not a student'}, status=status.HTTP_401_UNAUTHORIZED)


class RegisterCollegeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if hasattr(request.user, 'register'):
            college = request.user.register.college
            serializer = CollegeSerializer(college)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'error': 'User is not a registrar'}, status=status.HTTP_401_UNAUTHORIZED)


class LecturerCollegeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if hasattr(request.user, 'lecturer'):
            colleges = request.user.lecturer.college_set.all()
            serializer = CollegeSerializer(colleges, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'error': 'User is not a lecturer'}, status=status.HTTP_401_UNAUTHORIZED)


