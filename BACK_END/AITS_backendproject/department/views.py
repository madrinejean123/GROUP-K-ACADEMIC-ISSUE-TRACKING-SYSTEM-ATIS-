from django.shortcuts import render
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Department
from .serializer import DepartmentSerializer


class DepartmentView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        departments = Department.objects.all()
        serializer = DepartmentSerializer(departments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    
class StudentDepartmentView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if hasattr(request.user, 'student'):
            department = request.user.student.department
            serializer = DepartmentSerializer(department)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'error':'User is not a student'}, status=status.HTTP__401__Unauthorized)
    
    
class RegisterDepartmentView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if hasattr(request.user, 'register'):
            department = request.user.register.department
            serializer = DepartmentSerializer(department)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'error':'User is not a register'}, status=status.HTTP__401__Unauthorized)
    
    
class LecturerDepartmentView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if hasattr(request.user, 'lecturer'):
            department = request.user.lecturer.department
            serializer = DepartmentSerializer(department)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'error':'User is not a lecturer'}, status=status.HTTP__401__Unauthorized)
    
            