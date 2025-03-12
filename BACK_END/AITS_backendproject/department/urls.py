from django.urls import path
from . views import (DepartmentView, StudentDepartmentView, RegisterDepartmentView, LecturerDepartmentView)

urlpatterns = [
    path('departments/', DepartmentView.as_view(), name='department-list'),
    path('department/register/', RegisterDepartmentView.as_view(), name='register-department'),
    path('department/student/', StudentDepartmentView.as_view(), name='student-department'),
    path('department/lecturer/', LecturerDepartmentView.as_view(), name='lecturer-department'),
]
