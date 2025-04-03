# permissions.py
from rest_framework import permissions

class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'student')

class IsLecturer(permissions.BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'lecturer')

class IsCollegeRegister(permissions.BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'collegeregister')