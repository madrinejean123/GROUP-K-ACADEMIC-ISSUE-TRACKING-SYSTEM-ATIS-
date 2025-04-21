from django.urls import path
from .views import (
    CreateIssueView,
    CollegeRegisterAssignView,
    LecturerUpdateIssueStatusView,
    ListIssuesView,
    RetrieveIssueView,
    SecureFileDownloadView,
)

urlpatterns = [
    # 1️⃣ Student Issue Creation (Matches CreateIssueForm.jsx)
    path('create/', CreateIssueView.as_view(), name='create-issue'),
    
    # 2️⃣ Registrar Assignment (Matches IssueTable.jsx "Assign" button)
    path('assign/<int:issue_id>/', CollegeRegisterAssignView.as_view(), name='assign-issue'),
    
    # 3️⃣ Status Updates (Matches IssueDetail.jsx actions)
    path('update-status/<int:issue_id>/', LecturerUpdateIssueStatusView.as_view(), name='update-issue-status'),
    
    # 4️⃣ Issue Listing (Matches IssueList.jsx)
    path('list/', ListIssuesView.as_view(), name='list-issues'),
    
    # 5️⃣ Detailed View (Matches IssueDetail.jsx)
    path('detail/<int:pk>/', RetrieveIssueView.as_view(), name='retrieve-issue'),
    
    # 6️⃣ File Downloads (Matches attachment links in IssueDetail.jsx)
    path('issues/<int:issue_id>/download/', SecureFileDownloadView.as_view(), name='issue-download'),
]