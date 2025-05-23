"use client";

import { useState, useEffect } from "react";
import Header from "../../Components/layout/Header";
import Sidebar from "../../Components/layout/Sidebar";
import IssueList from "../../Components/issues/IssueList";
import CreateIssueForm from "../../Components/issues/CreateIssueForm";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [successMessage, setSuccessMessage] = useState("");

  // Mock data for preview environment
  const mockProfile = {
    full_name: "John Doe",
    student_no: "2021/BCS/001",
    college: { name: "College of Computing and Information Sciences" },
    school: { school_name: "School of Computing and Informatics Technology" },
    department: { name: "Computer Science" },
  };

  const mockIssues = [
    {
      id: 1,
      title: "Missing marks for CSC2101",
      description: "Missing coursework marks for Computer Programming course",
      status: "Open",
      category: "missing_marks",
      created_at: "2024-01-15T10:30:00Z",
      comments: [],
    },
    {
      id: 2,
      title: "Grade appeal for MATH1201",
      description: "Requesting review of final exam grade",
      status: "In Progress",
      category: "appeals",
      created_at: "2024-01-10T14:20:00Z",
      comments: [],
    },
  ];

  // Listen for sidebar navigation events
  useEffect(() => {
    const handleSidebarNavigation = (event) => {
      const { navItem } = event.detail;
      setActiveTab(navItem);
    };

    window.addEventListener("sidebarNavigation", handleSidebarNavigation);

    return () => {
      window.removeEventListener("sidebarNavigation", handleSidebarNavigation);
    };
  }, []);

  // Fetch the student profile and issues
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          console.log("No access token found, using mock data for preview");
          setStudentProfile(mockProfile);
          setIssues(mockIssues);
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

        // Handle authentication errors gracefully
        if (error.response?.status === 401) {
          console.log("Authentication failed, using mock data for preview");
          setStudentProfile(mockProfile);
          setIssues(mockIssues);
        } else {
          console.log("API error, using mock data for preview");
          setStudentProfile(mockProfile);
          setIssues(mockIssues);
        }
      }
    };

    fetchStudentData();
  }, []);

  // Normalize the status for filtering
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="dashboard-content">
            {/* Welcome Section */}
            <div className="welcome-section">
              <div className="welcome-banner">
                <h2>
                  {getGreeting()}, {studentProfile.full_name || "Student"} !
                </h2>
                <p>
                  Welcome to Makerere University Academic Issue Tracker. <br />
                  Log, track, and manage your academic-related issues here.
                </p>
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

            {/* Tabs Container */}
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

            {/* Steps for Logging Issues */}
            <div className="tips-card">
              <h3>Tips for Logging Issues</h3>
              <ul>
                <li>Be specific about the problem you're facing.</li>
                <li>Include relevant course codes or references.</li>
                <li>Attach supporting documents (PDFs, images, etc.).</li>
                <li>Provide screenshots when applicable.</li>
                <li>Check existing issues before creating a new one.</li>
                <li>
                  After creation of an issue, check the issue list for
                  satisfactory confirmation.
                </li>
                <li>Reload the page to update the time of creation.</li>
              </ul>
            </div>

            {/* Recent Issues Table */}
            <div className="issues-table-container">
              <h3>Recent Issues</h3>
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
                    issues.slice(0, 5).map((issue) => (
                      <tr key={issue.id}>
                        <td>#{issue.id}</td>
                        <td>{issue.title}</td>
                        <td>{issue.description}</td>
                        <td>{new Date(issue.created_at).toLocaleString()}</td>
                        <td>
                          <span
                            className={`status-badge status-${normalize(
                              issue.status
                            ).replace(" ", "-")}`}
                          >
                            {normalize(issue.status)}
                          </span>
                        </td>
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
        );

      case "issues":
        return (
          <IssueList
            issues={issues}
            title="All My Issues"
            onCreateIssue={() => setShowCreateIssueModal(true)}
            onViewIssue={(issue) => {
              setSelectedIssue(issue);
              setShowIssueDetailModal(true);
            }}
          />
        );

      case "history":
        return (
          <div className="history-content">
            <h3>Issue History</h3>
            <div className="history-timeline">
              {issues.length > 0 ? (
                issues
                  .sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                  )
                  .map((issue) => (
                    <div key={issue.id} className="timeline-item">
                      <div className="timeline-date">
                        {new Date(issue.created_at).toLocaleDateString()}
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <h4>{issue.title}</h4>
                          <span
                            className={`status-badge status-${normalize(
                              issue.status
                            ).replace(" ", "-")}`}
                          >
                            {normalize(issue.status)}
                          </span>
                        </div>
                        <p className="timeline-description">
                          {issue.description}
                        </p>
                        <button
                          className="action-button"
                          onClick={() => {
                            setSelectedIssue(issue);
                            setShowIssueDetailModal(true);
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))
              ) : (
                <p>No history to display.</p>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="dashboard-content">
            <h2>Page Not Found</h2>
            <p>The requested page could not be found.</p>
          </div>
        );
    }
  };

  return (
    <div className="student-dashboard">
      <ToastContainer />
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
        {/* Sidebar - Using your existing sidebar component */}
        <Sidebar
          sidebarOpen={true}
          userRole="Student"
          profile={studentProfile}
        />

        {/* Main Content */}
        <div className="dashboard-main-content">
          {/* Success message */}
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}

          {/* Dynamic Content Based on Active Tab */}
          {renderContent()}

          {/* Create Issue Modal */}
          {showCreateIssueModal && (
            <CreateIssueForm
              onSubmit={async (newIssue) => {
                // Create a new issue with ID and date
                const newIssueWithId = {
                  ...newIssue,
                  id: issues.length + 1,
                  created_at: new Date().toISOString(),
                  status: "Open",
                  comments: [],
                };

                // Update the issues state with the new issue at the beginning
                setIssues([newIssueWithId, ...issues]);
                setShowCreateIssueModal(false);

                // Show success toast
                toast.success(
                  `Issue "${newIssue.title}" created successfully!`,
                  {
                    position: "top-right",
                    autoClose: 3000,
                  }
                );
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
