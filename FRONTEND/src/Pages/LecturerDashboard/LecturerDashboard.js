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
const RESOLVE_ISSUE_API_URL =
  "https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/issues/update-status/";

const LecturerDashboard = () => {
  const [lecturerProfile, setLecturerProfile] = useState({});
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showIssueDetailModal, setShowIssueDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState("assigned");
  const [resolvingIssueId, setResolvingIssueId] = useState(null);

  // ─── 1️⃣ Fetch lecturer’s profile (unchanged) ───────────
  useEffect(() => {
    const fetchLecturerProfile = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      try {
        const { data } = await axios.get(PROFILE_API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLecturerProfile(Array.isArray(data) ? data[0] : data);
        console.log("✅ Fetched profile:", data);
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
      }
    };
    fetchLecturerProfile();
  }, []);

  // ─── 2️⃣ Fetch issues, filter by assigned_lecturer.id ────────
  useEffect(() => {
    // only run once we have a profile.id
    if (!lecturerProfile.id) return;

    const fetchIssues = async () => {
      console.log("➡️  Fetching issues for lecturer ID", lecturerProfile.id);
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.warn("⚠️  No access_token in localStorage");
        return;
      }
      try {
        const { data } = await axios.get(ALL_ISSUES_API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("📥 Received issues payload:", data);

        // match on assigned_lecturer.id === lecturerProfile.id
        const myIssues = data.filter(
          (issue) => issue.assigned_lecturer?.id === lecturerProfile.id
        );
        console.log("🔍  Filtered myIssues:", myIssues);

        setIssues(myIssues);
      } catch (err) {
        console.error("❌ Error fetching issue list:", err);
      }
    };

    fetchIssues();
  }, [lecturerProfile]);

  // ─── 3️⃣ Resolve an issue ───────────────────────────────
  const handleResolve = async (issueId) => {
    setResolvingIssueId(issueId);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No auth token");
      await axios.put(
        `${RESOLVE_ISSUE_API_URL}${issueId}/`,
        { status: "resolved" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIssues((prev) =>
        prev.map((i) =>
          i.id === issueId ? { ...i, status: "resolved" } : i
        )
      );
    } catch (err) {
      console.error("❌ Error resolving issue:", err);
    } finally {
      setResolvingIssueId(null);
    }
  };

  // ─── 4️⃣ Handlers for viewing / commenting (unchanged) ─────
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

  // ─── 5️⃣ Normalize & filter by status ───────────────────
  const normalize = (s) => s.replace(/_/g, " ").toLowerCase();
  const assignedIssues = issues.filter((i) => {
    const st = normalize(i.status);
    return st === "open" || st === "in progress";
  });
  const resolvedIssues = issues.filter((i) => {
    const st = normalize(i.status);
    return st === "resolved" || st === "closed";
  });
  const filteredIssues =
    activeTab === "assigned" ? assignedIssues : resolvedIssues;

  // ─── 6️⃣ Stats ───────────────────────────────────────────
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
          <h2>Welcome, Dr. {lecturerProfile.full_name || "Lecturer"}!</h2>
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

        {/* Tabs */}
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

        {/* IssueList (optional) */}
        <IssueList
          issues={filteredIssues}
          title={
            activeTab === "assigned" ? "Assigned Issues" : "Resolved Issues"
          }
          showCreateButton={false}
          onViewIssue={handleViewIssue}
          userRole="Lecturer"
        />

        {/* Table */}
        <div className="issues-table-container">
          <table className="issues-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Description</th>
                <th>Submitted At</th>
                <th>Status</th>
                {activeTab === "assigned" && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredIssues.length > 0 ? (
                filteredIssues.map((issue) => (
                  <tr key={issue.id}>
                    <td>#{issue.id}</td>
                    <td>{issue.title}</td>
                    <td>{issue.description}</td>
                    <td>{new Date(issue.created_at).toLocaleString()}</td>
                    <td>{normalize(issue.status)}</td>
                    {activeTab === "assigned" && (
                      <td>
                        <button
                          className="action-button"
                          onClick={() => handleResolve(issue.id)}
                          disabled={resolvingIssueId === issue.id}
                        >
                          {resolvingIssueId === issue.id
                            ? "Resolving..."
                            : "Resolve"}
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={activeTab === "assigned" ? 6 : 5}>
                    No issues to display.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Detail Modal */}
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
