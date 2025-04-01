from django.urls import path
from .views import (
    CollegeView,
    StudentCollegeView,
    RegisterCollegeView,
    LecturerCollegeView,
    StudentDepartmentView,
    StudentSchoolView,
    DepartmentView,
    RegisterDepartmentView,
    LecturerDepartmentView,
    CollegeListView,
)

urlpatterns = [
    # Department URLs
    path('departments/', DepartmentView.as_view(), name='department-list'),
    path('register/department/', RegisterDepartmentView.as_view(), name='register-department'),
    path('student/department/', StudentDepartmentView.as_view(), name='student-department'),
    path('lecturer/department/', LecturerDepartmentView.as_view(), name='lecturer-department'),
    
    # College URLs
    path('colleges/', CollegeListView.as_view(), name='college-list'),
    path('register/college/', RegisterCollegeView.as_view(), name='register-college'),
    path('student/college/', StudentCollegeView.as_view(), name='student-college'),
    path('student/school/', StudentSchoolView.as_view(), name='student-school'),
    path('lecturer/colleges/', LecturerCollegeView.as_view(), name='lecturer-college'),
]
