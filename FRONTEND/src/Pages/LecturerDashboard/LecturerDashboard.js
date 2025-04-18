"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../../Components/layout/DashboardLayout";
import IssueList from "../../Components/issues/IssueList";
import IssueDetail from "../../Components/issues/IssueDetail";
import "./lecturer-dashboard.css";
import axios from "axios";

const PROFILE_API_URL = 
  "https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/users/profile/";
const ISSUES_API_URL = 
  "https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/issues/list/";

const LecturerDashboard = () => {
  const [lecturerProfile, setLecturerProfile] = useState({});
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showIssueDetailModal, setShowIssueDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState("assigned");

  // Fetch lecturer profile once on mount
  useEffect(() => {
    const fetchLecturerProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          console.error("No access token found");
          return;
        }

        const { data } = await axios.get(PROFILE_API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // If your API returns an array, pick the first element
        setLecturerProfile(Array.isArray(data) ? data[0] : data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchLecturerProfile();
  }, []);

  // Fetch issues after profile is loaded (so we can stamp on assignee if needed)
  useEffect(() => {
    const fetchIssueList = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const { data } = await axios.get(ISSUES_API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // If you need to add the lecturer’s name as assignee:
        const enriched = data.map((issue) => ({
          ...issue,
          assignee: lecturerProfile.full_name
            ? `Dr. ${lecturerProfile.full_name}`
            : "Dr. Lecturer",
        }));

        setIssues(enriched);
      } catch (err) {
        console.error("Error fetching issue list:", err);
      }
    };

    // only call once profile is in state
    if (lecturerProfile.full_name !== undefined) {
      fetchIssueList();
    }
  }, [lecturerProfile]);

  const handleViewIssue = (issue) => {
    setSelectedIssue(issue);
    setShowIssueDetailModal(true);
  };

  const handleStatusChange = (newStatus) => {
    setIssues((all) =>
      all.map((i) => (i.id === selectedIssue.id ? { ...i, status: newStatus } : i))
    );
    setSelectedIssue((i) => ({ ...i, status: newStatus }));
  };

  const handleAddComment = (commentText) => {
    const newComment = {
      author: lecturerProfile.full_name
        ? `Dr. ${lecturerProfile.full_name}`
        : "Dr. Lecturer",
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

  // Tabs
  const assignedIssues = issues.filter(
    (i) => i.status === "Open" || i.status === "In Progress"
  );
  const resolvedIssues = issues.filter(
    (i) => i.status === "Resolved" || i.status === "Closed"
  );
  const filteredIssues = activeTab === "assigned" ? assignedIssues : resolvedIssues;

  const stats = {
    assignedIssues: assignedIssues.length,
    resolvedIssues: resolvedIssues.length,
    totalStudents: new Set(issues.map((i) => i.student)).size,
  };

  return (
    <DashboardLayout userRole="Lecturer" profile={lecturerProfile}>
      <div className="lecturer-dashboard">
        <div className="welcome-section">
          <h2>
            Welcome,{" "}
            {lecturerProfile.full_name
              ? `Dr. ${lecturerProfile.full_name}`
              : "Dr. Lecturer"}
            !
          </h2>
          <p>Manage and resolve student academic issues.</p>
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
          <button
            className={activeTab === "assigned" ? "tab active" : "tab"}
            onClick={() => setActiveTab("assigned")}
          >
            Assigned Issues
          </button>
          <button
            className={activeTab === "resolved" ? "tab active" : "tab"}
            onClick={() => setActiveTab("resolved")}
          >
            Resolved Issues
          </button>
        </div>

        <IssueList
          issues={filteredIssues}
          title={activeTab === "assigned" ? "Assigned Issues" : "Resolved Issues"}
          showCreateButton={false}
          onViewIssue={handleViewIssue}
          userRole="Lecturer"
        />

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
