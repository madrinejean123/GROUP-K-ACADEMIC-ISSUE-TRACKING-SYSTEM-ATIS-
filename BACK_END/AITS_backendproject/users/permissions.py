from rest_framework import permissions

class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.user_role == 'student'

class IsLecturer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.user_role == 'lecturer'

class IsCollegeRegister(permissions.BasePermission):
    
    def has_permission(self, request, view):
        return request.user.user_role == 'registrar'  # Matches USER_ROLES choice