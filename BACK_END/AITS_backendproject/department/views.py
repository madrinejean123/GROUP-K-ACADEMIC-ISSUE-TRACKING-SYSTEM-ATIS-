from django.shortcuts import render
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import College, School, Department
from .serializer import CollegeSerializer, SchoolSerializer, DepartmentSerializer


class CollegeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        colleges = College.objects.all()
        serializer = CollegeSerializer(colleges, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    
class StudentCollegeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if hasattr(request.user, 'student'):
            college = request.user.student.college
            serializer = CollegeSerializer(college)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'error':'User is not a student'}, status=status.HTTP_401_UNAUTHORIZED)
    

class StudentSchoolView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if hasattr(request.user, 'student'):
            school =  request.user.student.school
            serializer = SchoolSerializer(school)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'error':'User is not a student'}, status=status.HTTP_401_UNAUTHORIZED)
    
    
class StudentDepartmentView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    
    def get(self, request):
        if hasattr(request.user, 'student') and hasattr(request.user.student.department):
            department = request.user.student.department
            serializer = DepartmentSerializer(department)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'error':'User is not a student'}, status=status.HTTP_401_UNAUTHORIZED)
    
        
class RegisterCollegeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if hasattr(request.user, 'register'):
            college = request.user.register.college
            serializer = CollegeSerializer(college)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'error':'User is not a registrar'}, status=status.HTTP_401_UNAUTHORIZED)
    
    
class LecturerCollegeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if hasattr(request.user, 'lecturer'):
            colleges = request.user.lecturer.college_set.all()
            serializer = CollegeSerializer(colleges, many = True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'error':'User is not a lecturer'}, status=status.HTTP_401_UNAUTHORIZED)
    