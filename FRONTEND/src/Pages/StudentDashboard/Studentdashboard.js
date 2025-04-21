"use client";

import { useState, useEffect } from "react";
import Header from "../../Components/layout/Header";
import Sidebar from "../../Components/layout/Sidebar"; // Import the Sidebar
import IssueList from "../../Components/issues/IssueList";
import CreateIssueForm from "../../Components/issues/CreateIssueForm";
import IssueDetail from "../../Components/issues/IssueDetail";
import "./student-dashboard.css";
import axios from "axios";

const StudentDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [studentProfile, setStudentProfile] = useState({}); // Store complete profile data
  const [showCreateIssueModal, setShowCreateIssueModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showIssueDetailModal, setShowIssueDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Fetch student details (student name and complete profile) from the backend
  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          console.error("No access token found");
          return;
        }
        console.log("Access Token:", token);

        const response = await axios.get("https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/users/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = response.data;
        console.log("API Response:", data);

        // If the response is an array, take the first element.
        if (Array.isArray(data) && data.length > 0) {
          const profileData = data[0];
          console.log("Username from API:", profileData.username);
          setStudentProfile(profileData); // Store complete profile
        } else {
          setStudentProfile(data); // Store profile directly if not an array
        }

      } catch (error) {
        console.error("Error fetching student details:", error);
      }
    };

    fetchStudentDetails();
  }, []);

  // Function to get the first two names from the username
  const getFirstTwoNames = (name) => {
    if (!name || name.trim() === "") return "Loading..."; // Fallback if name is undefined or empty
    const names = name.trim().split(" ");
    return names.slice(0, 2).join(" "); // Take only the first two words
  };

  return (
    <div className="student-dashboard">
      {/* Render the Header */}
      <Header
        toggleSidebar={() => {}}
        isMobile={false}
        sidebarOpen={false}
        userRole="Student"
        profile={studentProfile}
      />

      {/* Dashboard Layout */}
      <div className="dashboard-layout">
        {/* Render the Sidebar */}
        <Sidebar
          sidebarOpen={true} // Sidebar is always open for now
          userRole="Student"
          profile={studentProfile}
        />

        {/* Main Content */}
        <div className="dashboard-main-content">
          {/* Welcome Section */}
          <div className="welcome-section">
            <div className="welcome-text">
              <h2>
                Welcome, {getFirstTwoNames(studentProfile.full_name)}!
              </h2>
              <p>Log, track and manage your academic-related issues here.</p>
              <div className="student-details">
                <p>
                  <strong>Student No:</strong> {studentProfile.student_no || "N/A"}
                </p>
              </div>
            </div>
            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-value">{issues.length}</div>
                <div className="stat-label">Total Issues</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{issues.filter((issue) => issue.status === "Open").length}</div>
                <div className="stat-label">Open Issues</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{issues.filter((issue) => issue.status === "In Progress").length}</div>
                <div className="stat-label">In Progress</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{issues.filter((issue) => issue.status === "Resolved" || issue.status === "Closed").length}</div>
                <div className="stat-label">Resolved</div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="tabs-container">
            <div className="tabs">
              <button
                className={`tab ${activeTab === "dashboard" ? "active" : ""}`}
                onClick={() => setActiveTab("dashboard")}
              >
                Dashboard
              </button>
              <button
                className={`tab ${activeTab === "issues" ? "active" : ""}`}
                onClick={() => setActiveTab("issues")}
              >
                My Issues
              </button>
              <button
                className={`tab ${activeTab === "history" ? "active" : ""}`}
                onClick={() => setActiveTab("history")}
              >
                History
              </button>
            </div>
          </div>

          {activeTab === "dashboard" && (
            <div className="dashboard-content">
              <div className="tips-card">
                <h3>Tips for logging issues</h3>
                <ul>
                  <li>Be specific about the problem you're facing</li>
                  <li>Include relevant course codes or references</li>
                  <li>Attach supporting documents (PDFs, images, etc.)</li>
                  <li>Provide screenshots when applicable</li>
                  <li>Check existing issues before creating a new one</li>
                </ul>
              </div>

              <IssueList
                issues={issues.filter(
                  (issue) => issue.status === "Open" || issue.status === "In Progress"
                )}
                title="Active Issues"
                onCreateIssue={() => setShowCreateIssueModal(true)}
                onViewIssue={(issue) => setSelectedIssue(issue)}
              />
            </div>
          )}

          {activeTab === "issues" && (
            <IssueList
              issues={issues}
              title="All My Issues"
              onCreateIssue={() => setShowCreateIssueModal(true)}
              onViewIssue={(issue) => setSelectedIssue(issue)}
            />
          )}

          {activeTab === "history" && (
            <div className="history-content">
              <div className="history-timeline">
                <h3>Issue Timeline</h3>
                {issues
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((issue) => (
                    <div key={issue.id} className="timeline-item">
                      <div className="timeline-date">{issue.date}</div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <h4>
                            #{issue.id}: {issue.title}
                          </h4>
                          <span
                            className={`status-badge status-${issue.status
                              .toLowerCase()
                              .replace(" ", "-")}`}
                          >
                            {issue.status}
                          </span>
                        </div>
                        <p className="timeline-description">{issue.description}</p>
                        <button
                          className="action-button"
                          onClick={() => setSelectedIssue(issue)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

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
