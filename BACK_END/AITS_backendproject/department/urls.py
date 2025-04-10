from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CollegeViewSet,
    CollegeSchoolsViewSet,
    SchoolDepartmentViewSet,
    StudentCollegeViewSet,
    StudentSchoolViewSet,
    StudentDepartmentViewSet,
    RegisterCollegeViewSet,
    LecturerCollegeViewSet,
    CreateCollegeViewSet,
    CreateSchoolViewSet,
    CreateDepartmentViewSet,
)

router = DefaultRouter()
router.register(r'colleges', CollegeViewSet, basename='college')
router.register(r'college/(?P<college_id>\d+)/schools', CollegeSchoolsViewSet, basename='college-schools')
router.register(r'school/(?P<school_id>\d+)/departments', SchoolDepartmentViewSet, basename='school-departments')
router.register(r'student/college', StudentCollegeViewSet, basename='student-college')
router.register(r'student/school', StudentSchoolViewSet, basename='student-school')
router.register(r'student/department', StudentDepartmentViewSet, basename='student-department')
router.register(r'register/college', RegisterCollegeViewSet, basename='register-college')
router.register(r'lecturer/colleges', LecturerCollegeViewSet, basename='lecturer-college')
router.register(r'admin/create-college', CreateCollegeViewSet, basename='create-college')
router.register(r'admin/create-school', CreateSchoolViewSet, basename='create-school')
router.register(r'admin/create-department', CreateDepartmentViewSet, basename='create-department')

urlpatterns = [
    path('', include(router.urls)),
]
