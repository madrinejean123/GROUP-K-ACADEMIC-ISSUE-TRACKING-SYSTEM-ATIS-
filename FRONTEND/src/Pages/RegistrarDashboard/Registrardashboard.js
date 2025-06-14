"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../../Components/layout/DashboardLayout";
import IssueList from "../../Components/issues/IssueList";
import IssueDetail from "../../Components/issues/IssueDetail";
import "./registrar-dashboard.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RegistrarDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showIssueDetailModal, setShowIssueDetailModal] = useState(false);
  const [lecturers, setLecturers] = useState([]);
  const [registrarProfile, setRegistrarProfile] = useState({});
  const [activeView, setActiveView] = useState("dashboard");

  // Normalize snake_case → human‑readable
  const normalizeStatus = (s = "") => s.replace(/_/g, " ").trim().toLowerCase();

  // Fetch the registrar profile
  useEffect(() => {
    async function fetchProfile() {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      try {
        const { data } = await axios.get(
          "https://aits-group-k-backen-edab8eb6b7d6.herokuapp.com/users/profile/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRegistrarProfile(Array.isArray(data) ? data[0] : data);
      } catch (e) {
        console.error("Profile error:", e);
      }
    }
    fetchProfile();
  }, []);

  // Fetch all the issues
  useEffect(() => {
    async function fetchIssues() {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      try {
        const { data } = await axios.get(
          "https://aits-group-k-backen-edab8eb6b7d6.herokuapp.com/issues/list/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const withAssignees = data.map((i) => ({
          ...i,
          assigneeName: i.assigned_lecturer?.user?.full_name || "",
          assigneeId: i.assigned_lecturer?.id || null,
        }));
        setIssues(withAssignees);
      } catch (e) {
        console.error("Issues error:", e);
      }
    }
    fetchIssues();
  }, []);

  // Fetch the lecturers
  useEffect(() => {
    async function fetchLecturers() {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      try {
        const { data } = await axios.get(
          "https://aits-group-k-backen-edab8eb6b7d6.herokuapp.com/users/users/lecturers/",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLecturers(data);
      } catch (e) {
        console.error("Lecturers error:", e);
      }
    }
    fetchLecturers();
  }, []);

  // Sidebar navigation
  useEffect(() => {
    const onNav = (e) => {
      if (e.detail?.navItem) {
        setActiveView(e.detail.navItem);
      }
    };
    window.addEventListener("sidebarNavigation", onNav);
    return () => window.removeEventListener("sidebarNavigation", onNav);
  }, []);

  const handleViewIssue = (issue) => {
    setSelectedIssue(issue);
    setShowIssueDetailModal(true);
  };

  const handleStatusChange = (newStatus) => {
    setIssues((prev) =>
      prev.map((i) =>
        i.id === selectedIssue.id ? { ...i, status: newStatus } : i
      )
    );
    setSelectedIssue((prev) => ({ ...prev, status: newStatus }));
  };

  const handleAddComment = (comment) => {
    const newComment = {
      author: registrarProfile.full_name || "Registrar",
      date: new Date().toISOString().split("T")[0],
      content: comment,
    };
    setIssues((prev) =>
      prev.map((i) =>
        i.id === selectedIssue.id
          ? { ...i, comments: [...(i.comments || []), newComment] }
          : i
      )
    );
    setSelectedIssue((prev) => ({
      ...prev,
      comments: [...(prev.comments || []), newComment],
    }));
  };

  const handleAssign = (issueId, lecturerId, lecturerName) => {
    // Update the issues state
    setIssues((prev) =>
      prev.map((i) =>
        i.id === issueId
          ? { ...i, assigneeName: lecturerName, assigneeId: lecturerId }
          : i
      )
    );

    // Update selected issue if it's the one being assigned
    if (selectedIssue?.id === issueId) {
      setSelectedIssue((prev) => ({
        ...prev,
        assigneeName: lecturerName,
        assigneeId: lecturerId,
      }));
    }

    // Show success toast notification
    toast.success(
      `Issue #${issueId} successfully assigned to ${lecturerName}`,
      {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      }
    );
  };

  // Stats & filters
  const stats = {
    total: issues.length,
    open: issues.filter((i) => i.status?.toLowerCase() === "open").length,
    inProgress: issues.filter((i) => i.status?.toLowerCase() === "in progress")
      .length,
    resolved: issues.filter((i) =>
      ["resolved", "closed"].includes(normalizeStatus(i.status))
    ).length,
  };

  const assignedIssues = issues.filter((i) => i.assigneeId);

  const lecturerCounts = lecturers.map((l) => ({
    id: l.id,
    name: l.user?.full_name || l.full_name || "",
    count: issues.filter((i) => i.assigneeId === l.id).length,
  }));

  // Render based on activeView
  const renderContent = () => {
    switch (activeView) {
      case "issues":
        return (
          <IssueList
            issues={issues}
            title="All Student Issues"
            showCreateButton={false}
            onViewIssue={handleViewIssue}
            onAssign={handleAssign}
            userRole="Registrar"
          />
        );

      case "assigned":
        return (
          <IssueList
            issues={assignedIssues}
            title="Assigned Issues"
            showCreateButton={false}
            onViewIssue={handleViewIssue}
            onAssign={handleAssign}
            userRole="Registrar"
          />
        );

      case "lecturers":
        return (
          <div className="lecturers-content">
            <h3>Lecturers Overview</h3>
            <div className="lecturers-grid">
              {lecturerCounts.map((l) => (
                <div key={l.id} className="lecturer-card">
                  <h4>{l.name}</h4>
                  <div className="lecturer-stats">
                    <span className="issue-count">{l.count}</span>
                    <span className="issue-label">
                      assigned issue{l.count !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "help":
        return (
          <div className="help-view">
            <h2>Help & Support</h2>
            <ul>
              <li>Email: support@mak.ac.ug</li>
              <li>Call: +256 414 123456</li>
              <li>Visit: Room 101, CIT Building</li>
            </ul>
          </div>
        );

      default:
        return (
          <div className="dashboard-content">
            {/* Welcome Section */}
            <div className="welcome-section">
              <div className="welcome-banner">
                <h2>
                  {getGreeting()}, {registrarProfile.full_name || "Registrar"}!
                </h2>
                <p>
                  Welcome to Makerere University Academic Issue Tracker. <br />
                  Manage and assign students' academic issues to appropriate
                  lecturers here.
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
                className={activeView === "dashboard" ? "tab active" : "tab"}
                onClick={() => setActiveView("dashboard")}
              >
                Dashboard
              </button>
              <button
                className={activeView === "issues" ? "tab active" : "tab"}
                onClick={() => setActiveView("issues")}
              >
                All Issues
              </button>
              <button
                className={activeView === "assigned" ? "tab active" : "tab"}
                onClick={() => setActiveView("assigned")}
              >
                Assigned Issues
              </button>
              <button
                className={activeView === "lecturers" ? "tab active" : "tab"}
                onClick={() => setActiveView("lecturers")}
              >
                Lecturers
              </button>
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
                    <th>Assigned To</th>
                    <th>Actions</th>
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
                            className={`status-badge status-${normalizeStatus(
                              issue.status
                            ).replace(" ", "-")}`}
                          >
                            {normalizeStatus(issue.status)}
                          </span>
                        </td>
                        <td>{issue.assigneeName || "Unassigned"}</td>
                        <td>
                          <button
                            className="action-button"
                            onClick={() => handleViewIssue(issue)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7">No issues to display.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <DashboardLayout userRole="Registrar" profile={registrarProfile}>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <div className="registrar-dashboard">{renderContent()}</div>

      {showIssueDetailModal && selectedIssue && (
        <IssueDetail
          issue={selectedIssue}
          onClose={() => setShowIssueDetailModal(false)}
          onStatusChange={handleStatusChange}
          onAddComment={handleAddComment}
          onAssign={handleAssign}
          userRole="Registrar"
          lecturers={lecturers}
        />
      )}
    </DashboardLayout>
  );
};

export default RegistrarDashboard;
