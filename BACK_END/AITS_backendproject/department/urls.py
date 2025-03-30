from django.urls import path
from .views import (
    DepartmentView,
    StudentDepartmentView,
    RegisterDepartmentView,
    LecturerDepartmentView,
    CollegeListView,  
)

urlpatterns = [
    path('departments/', DepartmentView.as_view(), name='department-list'),
    path('register/', RegisterDepartmentView.as_view(), name='register-department'),
    path('student/', StudentDepartmentView.as_view(), name='student-department'),
    path('lecturer/', LecturerDepartmentView.as_view(), name='lecturer-department'),
    path('colleges/', CollegeListView.as_view(), name='college-list'),  # Add the colleges endpoint
]
