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
const UPDATE_STATUS_API_URL =
  "https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/issues/update-status/";

const LecturerDashboard = () => {
  const [lecturerProfile, setLecturerProfile] = useState({});
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showIssueDetailModal, setShowIssueDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState("assigned");
  const [resolvingIssueId, setResolvingIssueId] = useState(null);

  // Fetch the lecturer's profile
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

  // Fetch the issues once we have a profile
  useEffect(() => {
    const fetchIssues = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      try {
        const { data } = await axios.get(ALL_ISSUES_API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("📥 Received issues:", data);
        setIssues(data);
      } catch (err) {
        console.error("❌ Error fetching issue list:", err);
      }
    };

    if (lecturerProfile.id) {
      fetchIssues();
    }
  }, [lecturerProfile]);

  // Handle resolving an issue — gather resolution notes and send in payload
  const handleResolve = async (issueId) => {
    // Prompt lecturer for resolution notes
    const notes = window.prompt(
      "Enter resolution notes (required) before resolving this issue:"
    );
    if (notes === null) {
      // Cancelled prompt
      return;
    }
    if (notes.trim() === "") {
      alert("Resolution notes cannot be empty.");
      return;
    }

    setResolvingIssueId(issueId);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No auth token");
      const payload = { status: "resolved", resolution_notes: notes };
      await axios.patch(
        `${UPDATE_STATUS_API_URL}${issueId}/`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update local state with new status and notes
      setIssues((prev) =>
        prev.map((i) =>
          i.id === issueId ? { ...i, status: "resolved", resolution_notes: notes } : i
        )
      );
    } catch (err) {
      console.error("❌ Error resolving issue:", err);
    } finally {
      setResolvingIssueId(null);
    }
  };

  // View the issue details
  const handleViewIssue = (issue) => {
    setSelectedIssue(issue);
    setShowIssueDetailModal(true);
  };

  // Status change callback from the IssueDetail modal
  const handleStatusChange = (newStatus, notes = null) => {
    setIssues((all) =>
      all.map((i) =>
        i.id === selectedIssue.id
          ? { ...i, status: newStatus, resolution_notes: notes || i.resolution_notes }
          : i
      )
    );
    setSelectedIssue((i) => ({ ...i, status: newStatus, resolution_notes: notes || i.resolution_notes }));
  };

  // Add the comment locally
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

  // Helpers for filtering
  const normalize = (s) => s.replace(/_/g, " ").toLowerCase();
  const assignedIssues = issues.filter((i) => {
    const st = normalize(i.status);
    return st === "open" || st === "in progress";
  });
  const resolvedIssues = issues.filter((i) => {
    const st = normalize(i.status);
    return st === "resolved" || st === "closed";
  });
  const filteredIssues = activeTab === "assigned" ? assignedIssues : resolvedIssues;

  // Quick Stats
  const stats = {
    assigned: assignedIssues.length,
    resolved: resolvedIssues.length,
    students: new Set(issues.map((i) => i.author.user.id)).size,
  };

  return (
    <DashboardLayout userRole="Lecturer" profile={lecturerProfile}>
      <div className="lecturer-dashboard">
        {/* Welcome / Stats */}
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
          >Assigned</button>
          <button
            className={activeTab === "resolved" ? "tab active" : "tab"}
            onClick={() => setActiveTab("resolved")}
          >Resolved</button>
        </div>

        {/* Issue List & Table */}
        <IssueList
          issues={filteredIssues}
          title={activeTab === "assigned" ? "Assigned Issues" : "Resolved Issues"}
          showCreateButton={false}
          onViewIssue={handleViewIssue}
          userRole="Lecturer"
        />
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
                          {resolvingIssueId === issue.id ? "Resolving..." : "Resolve"}
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={activeTab === "assigned" ? 6 : 5}>No issues to display.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Details Modal */}
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
