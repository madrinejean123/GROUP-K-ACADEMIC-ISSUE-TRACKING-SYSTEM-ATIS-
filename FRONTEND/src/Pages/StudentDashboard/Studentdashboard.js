import { useState, useEffect } from "react";
import Header from "../../Components/layout/Header";
import Sidebar from "../../Components/layout/Sidebar";
import IssueList from "../../Components/issues/IssueList";
import CreateIssueForm from "../../Components/issues/CreateIssueForm";
import IssueDetail from "../../Components/issues/IssueDetail";
import "./student-dashboard.css";
import axios from "axios";

const PROFILE_API_URL =
  "https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/users/profile/";
const ALL_ISSUES_API_URL =
  "https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/issues/list/";

const StudentDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [studentProfile, setStudentProfile] = useState({});
  const [showCreateIssueModal, setShowCreateIssueModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showIssueDetailModal, setShowIssueDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Fetch the student profile and issues
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          console.error("No access token found");
          return;
        }

        // Fetch the student profile
        const profileResponse = await axios.get(PROFILE_API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudentProfile(
          Array.isArray(profileResponse.data)
            ? profileResponse.data[0]
            : profileResponse.data
        );

        // Fetch the student issues
        const issuesResponse = await axios.get(ALL_ISSUES_API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIssues(issuesResponse.data);
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    fetchStudentData();
  }, []);

  // Normalize the  status for filtering
  const normalize = (status) => status.replace(/_/g, " ").toLowerCase();

  // Filter issues by status
  const openIssues = issues.filter(
    (issue) => normalize(issue.status) === "open"
  );
  const inProgressIssues = issues.filter(
    (issue) => normalize(issue.status) === "in progress"
  );
  const resolvedIssues = issues.filter(
    (issue) =>
      normalize(issue.status) === "resolved" ||
      normalize(issue.status) === "closed"
  );

  // Stats
  const stats = {
    total: issues.length,
    open: openIssues.length,
    inProgress: inProgressIssues.length,
    resolved: resolvedIssues.length,
  };

  return (
    <div className="student-dashboard">
      {/* Header */}
      <Header
        toggleSidebar={() => {}}
        isMobile={false}
        sidebarOpen={false}
        userRole="Student"
        profile={studentProfile}
      />

      {/* Layout */}
      <div className="dashboard-layout">
        {/* Sidebar */}
        <Sidebar
          sidebarOpen={true}
          userRole="Student"
          profile={studentProfile}
        />

        {/* Main Content */}
        <div className="dashboard-main-content">
          {/* Welcome Section */}
          <div className="welcome-section">
            <div className="welcome-text">
              <h2>Welcome, {studentProfile.full_name || "Student"}!</h2>
              <p>Log, track, and manage your academic-related issues here.</p>
              <div className="student-details">
                <p>
                  <strong>Student No:</strong>{" "}
                  {studentProfile.student_no || "N/A"}
                </p>
              </div>
            </div>
            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total Issues</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.open}</div>
                <div className="stat-label">Open Issues</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.inProgress}</div>
                <div className="stat-label">In Progress</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.resolved}</div>
                <div className="stat-label">Resolved</div>
              </div>
            </div>
          </div>

          {/* Tabs  */}
          <div className="tabs-container">
            <button
              className={activeTab === "dashboard" ? "tab active" : "tab"}
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </button>
            <button
              className={activeTab === "issues" ? "tab active" : "tab"}
              onClick={() => setActiveTab("issues")}
            >
              My Issues
            </button>
            <button
              className={activeTab === "history" ? "tab active" : "tab"}
              onClick={() => setActiveTab("history")}
            >
              History
            </button>
          </div>

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="dashboard-content">
              {/* Steps for Logging Issues */}
              <div className="tips-card">
                <h3>Tips for Logging Issues</h3>
                <ul>
                  <li>Be specific about the problem you're facing.</li>
                  <li>Include relevant course codes or references.</li>
                  <li>Attach supporting documents (PDFs, images, etc.).</li>
                  <li>Provide screenshots when applicable.</li>
                  <li>Check existing issues before creating a new one.</li>
                </ul>
              </div>

              {/* Issues Table */}
              <div className="issues-table-container">
                <table className="issues-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Submitted At</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.length > 0 ? (
                      issues.map((issue) => (
                        <tr key={issue.id}>
                          <td>#{issue.id}</td>
                          <td>{issue.title}</td>
                          <td>{issue.description}</td>
                          <td>{new Date(issue.created_at).toLocaleString()}</td>
                          <td>{normalize(issue.status)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5">No issues to display.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Issues tab */}
          {activeTab === "issues" && (
            <IssueList
              issues={issues}
              title="All My Issues"
              onCreateIssue={() => setShowCreateIssueModal(true)}
              onViewIssue={(issue) => setSelectedIssue(issue)}
            />
          )}

          {/* History-Tab */}
          {activeTab === "history" && (
            <div className="history-content">
              <h3>Issue History</h3>
              {issues.length > 0 ? (
                issues.map((issue) => (
                  <div key={issue.id} className="history-item">
                    <p>
                      <strong>Title:</strong> {issue.title}
                    </p>
                    <p>
                      <strong>Submitted On:</strong>{" "}
                      {new Date(issue.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p>No history to display.</p>
              )}
            </div>
          )}

          {/* Create the Issue Modal */}
          {showCreateIssueModal && (
            <CreateIssueForm
              onSubmit={(newIssue) => {
                const newIssueWithId = {
                  ...newIssue,
                  id: issues.length + 1,
                  date: new Date().toISOString().split("T")[0],
                  comments: [],
                };
                setIssues([newIssueWithId, ...issues]);
                setShowCreateIssueModal(false);
              }}
              onCancel={() => setShowCreateIssueModal(false)}
            />
          )}

          {/* Issue Detail Modal */}
          {showIssueDetailModal && selectedIssue && (
            <IssueDetail
              issue={selectedIssue}
              onClose={() => setShowIssueDetailModal(false)}
              onStatusChange={(action) => {
                const updatedIssues = issues.map((issue) =>
                  issue.id === selectedIssue.id
                    ? { ...issue, status: action }
                    : issue
                );
                setIssues(updatedIssues);
                setSelectedIssue({ ...selectedIssue, status: action });
              }}
              onAddComment={(comment) => {
                const newComment = {
                  author: "Student",
                  date: new Date().toISOString().split("T")[0],
                  content: comment,
                };

                const updatedIssue = {
                  ...selectedIssue,
                  comments: [...(selectedIssue.comments || []), newComment],
                };

                const updatedIssues = issues.map((issue) =>
                  issue.id === selectedIssue.id ? updatedIssue : issue
                );

                setIssues(updatedIssues);
                setSelectedIssue(updatedIssue);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
