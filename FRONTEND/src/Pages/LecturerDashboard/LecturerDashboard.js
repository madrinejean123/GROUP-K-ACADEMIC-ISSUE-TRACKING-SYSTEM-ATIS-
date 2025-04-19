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
  const [lecturerProfile, setLecturerProfile] = useState(null);
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showIssueDetailModal, setShowIssueDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState("assigned");

  // 1️⃣ Fetch your profile and keep the nested user object
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      try {
        const { data } = await axios.get(PROFILE_API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // API returns [{ id:7, user:{id:43,...} }], so grab the record then its .user
        const profileRec = Array.isArray(data) ? data[0] : data;
        setLecturerProfile(profileRec.user);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    })();
  }, []);

  // 2️⃣ Once we have lecturerProfile.user.id, fetch ALL issues and filter
  useEffect(() => {
    if (!lecturerProfile?.id) return;

    (async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      try {
        const { data } = await axios.get(ALL_ISSUES_API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Match on the nested user.id (43), not the record id (7)
        const myIssues = data.filter(
          (issue) =>
            issue.assigned_lecturer?.user?.id === lecturerProfile.id
        );

        setIssues(myIssues);
      } catch (err) {
        console.error("Error fetching issues:", err);
      }
    })();
  }, [lecturerProfile]);

  // 3️⃣ Stats & tab splitting — catch both snake_case & human  
  const assignedIssues = issues.filter(
    (i) =>
      !["resolved", "closed"].includes(i.status.toLowerCase())
  );
  const resolvedIssues = issues.filter((i) =>
    ["resolved", "closed"].includes(i.status.toLowerCase())
  );
  const filteredIssues =
    activeTab === "assigned" ? assignedIssues : resolvedIssues;

  const stats = {
    assigned: assignedIssues.length,
    resolved: resolvedIssues.length,
    students: new Set(issues.map((i) => i.author.user.id)).size,
  };

  return (
    <DashboardLayout userRole="Lecturer" profile={lecturerProfile || {}}>
      <div className="lecturer-dashboard">
        <div className="welcome-section">
          <h2>Welcome, Dr. {lecturerProfile?.full_name || ""}!</h2>
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

        <IssueList
          issues={filteredIssues}
          title={activeTab === "assigned" ? "Assigned Issues" : "Resolved Issues"}
          showCreateButton={false}
          onViewIssue={(i) => {
            setSelectedIssue(i);
            setShowIssueDetailModal(true);
          }}
          userRole="Lecturer"
        />

        {showIssueDetailModal && selectedIssue && (
          <IssueDetail
            issue={selectedIssue}
            onClose={() => setShowIssueDetailModal(false)}
            onStatusChange={(newStatus) => {
              setIssues((all) =>
                all.map((i) =>
                  i.id === selectedIssue.id ? { ...i, status: newStatus } : i
                )
              );
              setSelectedIssue((i) => ({ ...i, status: newStatus }));
            }}
            onAddComment={(c) => {
              const comment = {
                author: `Dr. ${lecturerProfile.full_name}`,
                date: new Date().toISOString().split("T")[0],
                content: c,
              };
              setIssues((all) =>
                all.map((i) =>
                  i.id === selectedIssue.id
                    ? { ...i, comments: [...(i.comments || []), comment] }
                    : i
                )
              );
              setSelectedIssue((i) => ({
                ...i,
                comments: [...(i.comments || []), comment],
              }));
            }}
            userRole="Lecturer"
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default LecturerDashboard;
