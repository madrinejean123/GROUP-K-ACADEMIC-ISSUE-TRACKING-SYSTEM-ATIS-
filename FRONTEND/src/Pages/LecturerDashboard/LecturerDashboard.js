"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../../Components/layout/DashboardLayout";
import IssueList from "../../Components/issues/IssueList";
import IssueDetail from "../../Components/issues/IssueDetail";
import { mockIssues } from "../../mock-data";
import "./lecturer-dashboard.css";

const LecturerDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showIssueDetailModal, setShowIssueDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState("assigned");
  const [lecturerName, setLecturerName] = useState(""); // State for lecturer's name

  // Fetch lecturer's name from the backend
  useEffect(() => {
    const fetchLecturerName = async () => {
      try {
        const token = localStorage.getItem("access_token"); // Retrieve the JWT token
        const response = await fetch("http://127.0.0.1:8000/users/profile/", {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the request headers
          },
        });

        if (response.ok) {
          const data = await response.json();
          setLecturerName(`Dr. ${data.username}`); // Prepend "Dr." to the name
        } else {
          console.error("Failed to fetch lecturer name:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching lecturer name:", error);
      }
    };

    fetchLecturerName();
  }, []);

  // Load issues with student information
  useEffect(() => {
    const assignedIssues = mockIssues
      .filter(
        (issue) => issue.status === "In Progress" || issue.status === "Open"
      )
      .map((issue) => ({
        ...issue,
        student: "John Doe", // Mock student name
        studentId: "STD" + Math.floor(Math.random() * 10000),
        assignee: "Dr. Lecturer", // Current lecturer
      }));

    const resolvedIssues = mockIssues
      .filter(
        (issue) => issue.status === "Resolved" || issue.status === "Closed"
      )
      .map((issue) => ({
        ...issue,
        student: "Jane Smith", // Mock student name
        studentId: "STD" + Math.floor(Math.random() * 10000),
        assignee: "Dr. Lecturer", // Current lecturer
      }));

    setIssues([...assignedIssues, ...resolvedIssues]);
  }, []);

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
      author: "Dr. Lecturer",
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

  const getFilteredIssues = () => {
    if (activeTab === "assigned") {
      return issues.filter(
        (issue) => issue.status === "Open" || issue.status === "In Progress"
      );
    } else {
      return issues.filter(
        (issue) => issue.status === "Resolved" || issue.status === "Closed"
      );
    }
  };

  const filteredIssues = getFilteredIssues();

  const stats = {
    assignedIssues: issues.filter(
      (issue) => issue.status === "Open" || issue.status === "In Progress"
    ).length,
    resolvedIssues: issues.filter(
      (issue) => issue.status === "Resolved" || issue.status === "Closed"
    ).length,
    totalStudents: [...new Set(issues.map((issue) => issue.student))].length,
  };

  return (
    <DashboardLayout userRole="Lecturer">
      <div className="lecturer-dashboard">
        <div className="welcome-section">
          <div className="welcome-text">
            <h2>Welcome, {lecturerName || "Dr. Lecturer"}!</h2>
            <p>
              Manage and resolve student related academic issues assigned to
              you.
            </p>
          </div>
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-value">{stats.assignedIssues}</div>
              <div className="stat-label">Assigned Issues</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.resolvedIssues}</div>
              <div className="stat-label">Resolved Issues</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalStudents}</div>
              <div className="stat-label">Students</div>
            </div>
          </div>
        </div>

        <div className="tabs-container">
          <div className="tabs">
            <button
              className={`tab ${activeTab === "assigned" ? "active" : ""}`}
              onClick={() => setActiveTab("assigned")}
            >
              Assigned Issues
            </button>
            <button
              className={`tab ${activeTab === "resolved" ? "active" : ""}`}
              onClick={() => setActiveTab("resolved")}
            >
              Resolved Issues
            </button>
          </div>
        </div>

        <IssueList
          issues={filteredIssues}
          title={
            activeTab === "assigned" ? "Assigned Issues" : "Resolved Issues"
          }
          showCreateButton={false}
          onViewIssue={handleViewIssue}
          userRole="Lecturer"
        />
      </div>

      {showIssueDetailModal && selectedIssue && (
        <IssueDetail
          issue={selectedIssue}
          onClose={() => setShowIssueDetailModal(false)}
          onStatusChange={handleStatusChange}
          onAddComment={handleAddComment}
          userRole="Lecturer"
        />
      )}
    </DashboardLayout>
  );
};

export default LecturerDashboard;
