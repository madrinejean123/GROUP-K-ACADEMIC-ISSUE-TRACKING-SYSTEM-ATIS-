from django.utils import path
from .views import IssueView, IssueDetailView, CollegeRegisterIssueView, StudentSendIssueView, LecturerIssueView, StudentSendIssueView, RegisterAssignIssueView


urlpatterns = [
    path('issues/', IssueView.as_view(), name='issue-list'),
    path('<issues/<int:pk>/', IssueDetailView.as_view(), name='issue-detail'),
    path('register/issues/', CollegeRegisterIssueView.as_view(), name='register-issues'),
    path('lecturer/issues/', LecturerIssueView.as_view(), name='lecturer-issues'),
    path('student/send-issue/', StudentSendIssueView.as_view(), name='student-send-issue'),
    path('register/assign-issue/', RegisterAssignIssueView.as_view(), name='register-assign-issue'),
    
]
