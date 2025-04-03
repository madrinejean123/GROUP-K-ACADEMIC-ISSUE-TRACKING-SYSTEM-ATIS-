from django.urls import path
from .views import CreateIssueView, CollegeRegisterAssignView, LecturerUpdateIssueStatusView, ListIssuesView, RetrieveIssueView

urlpatterns = [
    # 1️⃣ API for Students to Create an Issue
    path('create/', CreateIssueView.as_view(), name='create-issue'),

    # 2️⃣ API for College Register to View & Assign Issues
    path('assign/<int:issue_id>/', CollegeRegisterAssignView.as_view(), name='assign-issue'),

    # 3️⃣ API for Lecturers to Update Issue Status
    path('update-status/<int:issue_id>/', LecturerUpdateIssueStatusView.as_view(), name='update-issue-status'),

    # 4️⃣ API to List Issues (For All Users)
    path('list/', ListIssuesView.as_view(), name='list-issues'),

    # 5️⃣ API to Retrieve a Specific Issue
    path('detail/<int:pk>/', RetrieveIssueView.as_view(), name='retrieve-issue'),

    # Additional routes from the `main` branch, if needed
    path('issues/', IssueView.as_view(), name='issue-list'),
    path('issues/<int:pk>/', IssueDetailView.as_view(), name='issue-detail'),
    path('register/issues/', CollegeRegisterIssueView.as_view(), name='register-issues'),
    path('lecturer/issues/', LecturerIssueView.as_view(), name='lecturer-issues'),
    path('student/send-issue/', StudentSendIssueView.as_view(), name='student-send-issue'),
    path('register/assign-issue/', RegisterAssignIssueView.as_view(), name='register-assign-issue'),
]
