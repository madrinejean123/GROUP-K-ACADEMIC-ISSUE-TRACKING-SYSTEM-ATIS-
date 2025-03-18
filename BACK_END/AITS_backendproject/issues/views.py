from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .serializer import IssueSerializers
from users.models import Student, Lecturer, CollegeRegister
from .models import Issues
class IssueView(APIView):
    def get(self, request):
        issues = Issues.objects.all()
        serializer = IssueSerializers(issues, many=True)
        return Response(serializer.data)
    
    
    def post(self, request):
        serializer = IssueSerializers(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user.student)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class IssueDetailView(APIView):
    def get(self, request, pk):
        try:
            issue = Issues.objects.get(pk=pk)
            serializer = IssueSerializers(issue)
            return Response(serializer.data)
        except Issues.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
    def put(self, request, pk):
        try:
            issue = Issues.objects.get(pk=pk)
            serializer = IssueSerializers(issue, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Issues.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        
    def delete(self, request, pk):
        try:
            issue = Issues.objects.get(pk=pk)
            issue.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Issues.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        
class CollegeRegisterIssueView(APIView):
    def get(self, request):
        issues = Issues.objects.filter(register=request.user.collegeregister)
        serializer = IssueSerializers(issues, many=True)
        return Response(serializer.data)
    
    
class LecturerIssueView(APIView):
    def get(self, request):
        issues = Issues.objects.filter(assigned_lecturer=request.user.lecturer)
        serializer = IssueSerializers(issues, many=True)
        return Response(serializer.data)


class StudentSendIssueView(APIView):
    def post(self, request):
        issue_id = request.data.get('issue_id')
        issue = Issues.objects.get(pk=issue_id)
        issue.status = 'pending'
        issue.register = request.user.collegeregister
        issue.save()
        return Response({'message':'Issue sent to register'}, status=status.HTTP_200_OK)
    
    
class RegisterAssignIssueView(APIView):
    def post(self, request):
        issue_id = request.data.get('issue_id')
        lecturer_id = request.data.get('lecturer_id')
        issue = Issues.objects.get(pk=lecturer_id)
        lecturer = Lecturer.objects.get(pk=issue_id) 
        issue.status = 'pending'
        issue.assigned_lecturer = lecturer
        issue.save()
        return Response({'message':'Issue assigned to lecturer'}, status=status.HTTP_200_OK)