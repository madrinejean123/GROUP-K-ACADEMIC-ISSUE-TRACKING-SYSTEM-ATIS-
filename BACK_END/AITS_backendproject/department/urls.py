from django.urls import path
from .views import (
    CollegeView,
    StudentCollegeView,
    RegisterCollegeView,
    LecturerCollegeView,
    StudentDepartmentView,
    StudentSchoolView,
    CollegeSchoolsView,
    SchoolDepartmentView, 
    CreateDepartmentView,
    CreateCollegeView,
    CreateSchoolView,
)

urlpatterns = [
    path('student/department/', StudentDepartmentView.as_view(), name='student-department'),
    path('colleges/', CollegeView.as_view(), name='college-list'),
    path('register/college/', RegisterCollegeView.as_view(), name='register-college'),
    path('student/college/', StudentCollegeView.as_view(), name='student-college'),
    path('student/school/', StudentSchoolView.as_view(), name='student-school'),
    path('lecturer/colleges/', LecturerCollegeView.as_view(), name='lecturer-college'),
    path('college/schools/',CollegeSchoolsView.as_view(),name='college-schools' ),
    path('school/departments/', SchoolDepartmentView.as_view(), name='school-departments'),
    path('create/department', CreateDepartmentView.as_view(), name='create-department'),
    path('create/college/', CreateCollegeView.as_view(), name='create-college'),
    path('create/school/', CreateSchoolView.as_view(), name='create-school'),
]
