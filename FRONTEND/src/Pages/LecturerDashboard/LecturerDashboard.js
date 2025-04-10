"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../../Components/layout/DashboardLayout";
import IssueList from "../../Components/issues/IssueList";
import IssueDetail from "../../Components/issues/IssueDetail";
import { mockIssues } from "../../mock-data";
import "./lecturer-dashboard.css";
import axios from "axios";  // 📌 ADDED

const LecturerDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showIssueDetailModal, setShowIssueDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState("assigned");
  // 📌 NEW state to hold the fetched profile
  const [lecturerProfile, setLecturerProfile] = useState({});

  // 📌 Fetch the lecturer's full profile from the backend
  useEffect(() => {
    const fetchLecturerProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return console.error("No access token found");

        const response = await axios.get(
          "https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/users/profile/",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = response.data;
        // handle array vs object
        const profileData = Array.isArray(data) ? data[0] : data;
        setLecturerProfile(profileData);
      } catch (error) {
        console.error("Error fetching lecturer profile:", error);
      }
    };

    fetchLecturerProfile();
  }, []);

  // Load issues with student information
  useEffect(() => {
    const assignedIssues = mockIssues
      .filter(
        (issue) => issue.status === "In Progress" || issue.status === "Open"
      )
      .map((issue) => ({
        ...issue,
        student: "John Doe",
        studentId: "STD" + Math.floor(Math.random() * 10000),
        assignee: lecturerProfile.full_name
          ? `Dr. ${lecturerProfile.full_name}`
          : "Dr. Lecturer",
      }));

    const resolvedIssues = mockIssues
      .filter(
        (issue) => issue.status === "Resolved" || issue.status === "Closed"
      )
      .map((issue) => ({
        ...issue,
        student: "Jane Smith",
        studentId: "STD" + Math.floor(Math.random() * 10000),
        assignee: lecturerProfile.full_name
          ? `Dr. ${lecturerProfile.full_name}`
          : "Dr. Lecturer",
      }));

    setIssues([...assignedIssues, ...resolvedIssues]);
  }, [lecturerProfile]);  // 📌 re-run when profile arrives

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
      author: lecturerProfile.full_name
        ? `Dr. ${lecturerProfile.full_name}`
        : "Dr. Lecturer",
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
    <DashboardLayout userRole="Lecturer" profile={lecturerProfile}> {/* 📌 PASS profile down if needed */}
      <div className="lecturer-dashboard">
        <div className="welcome-section">
          <div className="welcome-text">
            <h2>
              Welcome,{" "}
              {lecturerProfile.full_name
                ? `Dr. ${lecturerProfile.full_name}`
                : "Dr. Lecturer"}
              !
            </h2>
            <p>Manage and resolve student academic issues assigned to you.</p>
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
