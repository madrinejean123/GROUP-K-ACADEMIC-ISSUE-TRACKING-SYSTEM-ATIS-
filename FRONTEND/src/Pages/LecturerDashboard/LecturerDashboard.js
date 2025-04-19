"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../../Components/layout/DashboardLayout";
import IssueList from "../../Components/issues/IssueList";
import IssueDetail from "../../Components/issues/IssueDetail";
import "./lecturer-dashboard.css";
import axios from "axios";

const PROFILE_API_URL =
  "https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/users/profile/";
const ALL_ISSUES_API_URL =
  "https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/issues/list/";

const LecturerDashboard = () => {
  const [lecturerProfile, setLecturerProfile] = useState({});
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showIssueDetailModal, setShowIssueDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState("assigned");

  // 1️⃣ Fetch lecturer’s own profile
  useEffect(() => {
    const fetchLecturerProfile = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const { data } = await axios.get(PROFILE_API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLecturerProfile(Array.isArray(data) ? data[0] : data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchLecturerProfile();
  }, []);

  // 2️⃣ Once we have the lecturer’s ID, fetch **all** issues, then filter to theirs
  useEffect(() => {
    if (!lecturerProfile.id) return;

    const fetchAssignedIssues = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const { data } = await axios.get(ALL_ISSUES_API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Keep only those where assigned_lecturer.id === this lecturer’s id
        const myIssues = data
          .filter((issue) => issue.assigned_lecturer?.id === lecturerProfile.id)
          // optional: stamp on a nicer assignee name
          .map((issue) => ({
            ...issue,
            assignee: `Dr. ${lecturerProfile.full_name}`,
          }));

        setIssues(myIssues);
      } catch (err) {
        console.error("Error fetching issue list:", err);
      }
    };

    fetchAssignedIssues();
  }, [lecturerProfile]);

  // ↪️ Handlers for viewing/detailing
  const handleViewIssue = (issue) => {
    setSelectedIssue(issue);
    setShowIssueDetailModal(true);
  };

  const handleStatusChange = (newStatus) => {
    setIssues((all) =>
      all.map((i) =>
        i.id === selectedIssue.id ? { ...i, status: newStatus } : i
      )
    );
    setSelectedIssue((i) => ({ ...i, status: newStatus }));
  };

  const handleAddComment = (commentText) => {
    const newComment = {
      author: `Dr. ${lecturerProfile.full_name}`,
      date: new Date().toISOString().split("T")[0],
      content: commentText,
    };

    setIssues((all) =>
      all.map((i) =>
        i.id === selectedIssue.id
          ? { ...i, comments: [...(i.comments || []), newComment] }
          : i
      )
    );
    setSelectedIssue((i) => ({
      ...i,
      comments: [...(i.comments || []), newComment],
    }));
  };

  // ↪️ Tabs: assigned vs. resolved
  const assignedIssues = issues.filter(
    (i) => i.status.toLowerCase() === "open" ||
           i.status.toLowerCase() === "in progress"
  );
  const resolvedIssues = issues.filter(
    (i) => i.status.toLowerCase() === "resolved" ||
           i.status.toLowerCase() === "closed"
  );
  const filteredIssues =
    activeTab === "assigned" ? assignedIssues : resolvedIssues;

  // ↪️ Simple stats
  const stats = {
    assigned: assignedIssues.length,
    resolved: resolvedIssues.length,
    students: new Set(issues.map((i) => i.author.user.id)).size,
  };

  return (
    <DashboardLayout userRole="Lecturer" profile={lecturerProfile}>
      <div className="lecturer-dashboard">
        {/* Welcome + stats */}
        <div className="welcome-section">
          <h2>Welcome, Dr. {lecturerProfile.full_name || ""}!</h2>
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-value">{stats.assigned}</div>
              <div className="stat-label">Assigned</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.resolved}</div>
              <div className="stat-label">Resolved</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.students}</div>
              <div className="stat-label">Students</div>
            </div>
          </div>
        </div>

        {/* Tab buttons */}
        <div className="tabs-container">
          <button
            className={activeTab === "assigned" ? "tab active" : "tab"}
            onClick={() => setActiveTab("assigned")}
          >
            Assigned
          </button>
          <button
            className={activeTab === "resolved" ? "tab active" : "tab"}
            onClick={() => setActiveTab("resolved")}
          >
            Resolved
          </button>
        </div>

        {/* 3️⃣ Pass your filtered issues into IssueList */}
        <IssueList
          issues={filteredIssues}
          title={activeTab === "assigned" ? "Assigned Issues" : "Resolved Issues"}
          showCreateButton={false}
          onViewIssue={handleViewIssue}
          userRole="Lecturer"
        />

        {/* 4️⃣ And when you open one, pass it into IssueDetail */}
        {showIssueDetailModal && selectedIssue && (
          <IssueDetail
            issue={selectedIssue}
            onClose={() => setShowIssueDetailModal(false)}
            onStatusChange={handleStatusChange}
            onAddComment={handleAddComment}
            userRole="Lecturer"
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default LecturerDashboard;
