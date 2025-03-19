"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../../Components/layout/DashboardLayout";
import IssueList from "../../Components/issues/IssueList";
import CreateIssueForm from "../../Components/issues/CreateIssueForm";
import IssueDetail from "../../Components/issues/IssueDetail";
import { mockIssues } from "../../mock-data";
import "./student-dashboard.css";

const StudentDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [showCreateIssueModal, setShowCreateIssueModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showIssueDetailModal, setShowIssueDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    //  API call here
    setIssues(mockIssues);
  }, []);

  const handleCreateIssue = () => {
    setShowCreateIssueModal(true);
  };

  const handleViewIssue = (issue) => {
    setSelectedIssue(issue);
    setShowIssueDetailModal(true);
  };

  const handleStatusChange = (action) => {
    const updatedIssues = issues.map((issue) =>
      issue.id === selectedIssue.id ? { ...issue, status: action } : issue
    );
    setIssues(updatedIssues);
    setSelectedIssue({ ...selectedIssue, status: action });
  };

  const handleAddComment = (comment) => {
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
  };

  const handleNewIssueSubmit = (newIssue) => {
    //  API call to create a new issue here
    const newIssueWithId = {
      ...newIssue,
      id: issues.length + 1,
      date: new Date().toISOString().split("T")[0],
      comments: [],
    };
    setIssues([newIssueWithId, ...issues]);
    setShowCreateIssueModal(false);
  };

  // Dashboard stats
  const stats = {
    totalIssues: issues.length,
    openIssues: issues.filter((issue) => issue.status === "Open").length,
    inProgressIssues: issues.filter((issue) => issue.status === "In Progress")
      .length,
    resolvedIssues: issues.filter(
      (issue) => issue.status === "Resolved" || issue.status === "Closed"
    ).length,
  };

  return (
    <DashboardLayout userRole="Student">
      <div className="student-dashboard">
        <div className="welcome-section">
          <div className="welcome-text">
            <h2>Welcome, Student!</h2>
            <p>Track and manage your academic issues in one place.</p>
          </div>
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-value">{stats.totalIssues}</div>
              <div className="stat-label">Total Issues</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.openIssues}</div>
              <div className="stat-label">Open Issues</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.inProgressIssues}</div>
              <div className="stat-label">In Progress</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.resolvedIssues}</div>
              <div className="stat-label">Resolved</div>
            </div>
          </div>
        </div>

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
                (issue) =>
                  issue.status === "Open" || issue.status === "In Progress"
              )}
              title="Active Issues"
              onCreateIssue={handleCreateIssue}
              onViewIssue={handleViewIssue}
              userRole="Student"
            />
          </div>
        )}

        {activeTab === "issues" && (
          <IssueList
            issues={issues}
            title="All My Issues"
            onCreateIssue={handleCreateIssue}
            onViewIssue={handleViewIssue}
            userRole="Student"
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
                      <p className="timeline-description">
                        {issue.description}
                      </p>
                      <button
                        className="action-button"
                        onClick={() => handleViewIssue(issue)}
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
            onSubmit={handleNewIssueSubmit}
            onCancel={() => setShowCreateIssueModal(false)}
          />
        )}

        {showIssueDetailModal && selectedIssue && (
          <IssueDetail
            issue={selectedIssue}
            onClose={() => setShowIssueDetailModal(false)}
            onStatusChange={handleStatusChange}
            onAddComment={handleAddComment}
            userRole="Student"
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
