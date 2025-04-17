"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../../Components/layout/DashboardLayout";
import IssueList from "../../Components/issues/IssueList";
import IssueDetail from "../../Components/issues/IssueDetail";
import "./registrar-dashboard.css";
import axios from "axios";

const RegistrarDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showIssueDetailModal, setShowIssueDetailModal] = useState(false);
  const [lecturers] = useState([
    { id: 1, name: "Dr. Jane Doe", department: "Computer Science", assignedIssues: 3 },
    { id: 2, name: "Prof. Michael Mutebi", department: "Mathematics", assignedIssues: 5 },
    { id: 3, name: "Dr. Sarah Williams", department: "Engineering", assignedIssues: 2 },
    { id: 4, name: "Prof. Robert Kato", department: "Physics", assignedIssues: 0 },
  ]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [activeView, setActiveView] = useState("dashboard");
  const [registrarProfile, setRegistrarProfile] = useState({});

  // 1️⃣ Fetch registrar profile
  useEffect(() => {
    async function fetchProfile() {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      try {
        const { data } = await axios.get(
          "https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/users/profile/",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRegistrarProfile(Array.isArray(data) ? data[0] : data);
      } catch (e) {
        console.error("Profile error:", e);
      }
    }
    fetchProfile();
  }, []);

  // 2️⃣ Fetch all issues once (dashboard is authenticated)
  useEffect(() => {
    async function fetchIssues() {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      try {
        const { data } = await axios.get(
          "https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/issues/list/",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIssues(data);
      } catch (e) {
        console.error("Issues error:", e);
      }
    }
    fetchIssues();
  }, []);

  // Sidebar navigation
  useEffect(() => {
    const onNav = (e) => e.detail?.navItem && setActiveView(e.detail.navItem);
    window.addEventListener("sidebarNavigation", onNav);
    return () => window.removeEventListener("sidebarNavigation", onNav);
  }, []);

  const handleViewIssue = (issue) => {
    setSelectedIssue(issue);
    setShowIssueDetailModal(true);
  };

  const handleStatusChange = (newStatus) => {
    if (newStatus === "assign") return setShowAssignModal(true);
    setIssues((prev) =>
      prev.map((i) => (i.id === selectedIssue.id ? { ...i, status: newStatus } : i))
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

  // Stubbed assign (no API)
  const handleAssignIssue = () => {
    if (!selectedLecturer) return;
    const lec = lecturers.find((l) => l.id === selectedLecturer);
    setIssues((prev) =>
      prev.map((i) =>
        i.id === selectedIssue.id
          ? { ...i, status: "In Progress", assignee: lec.name }
          : i
      )
    );
    setSelectedIssue((prev) => ({
      ...prev,
      status: "In Progress",
      assignee: lec.name,
    }));
    setShowAssignModal(false);
    setSelectedLecturer(null);
  };

  // Stats for default dashboard
  const stats = {
    total: issues.length,
    open: issues.filter((i) => i.status === "Open").length,
    inProgress: issues.filter((i) => i.status === "In Progress").length,
    resolved: issues.filter((i) => ["Resolved", "Closed"].includes(i.status)).length,
  };
  const assignedIssues = issues.filter((i) => i.assignee);

  const renderContent = () => {
    switch (activeView) {
      case "issues":
        return (
          <IssueList
            issues={issues}
            title="All Student Issues"
            showCreateButton={false}
            onViewIssue={handleViewIssue}
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
            userRole="Registrar"
          />
        );
      case "lecturers":
        return (
          <div className="lecturers-view">
            <h2>Lecturers</h2>
            <div className="lecturers-list-full">
              {lecturers.map((lecturer) => (
                <div key={lecturer.id} className="lecturer-card-full">
                  <div className="lecturer-info-full">
                    <h3>{lecturer.name}</h3>
                    <p className="lecturer-department">{lecturer.department}</p>
                    <div className="lecturer-stats-full">
                      <div className="stat-item">
                        <span className="stat-value">{lecturer.assignedIssues}</span>
                        <span className="stat-label">Assigned Issues</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">
                          {issues.filter(
                            (i) =>
                              i.assignee === lecturer.name &&
                              ["Resolved", "Closed"].includes(i.status)
                          ).length}
                        </span>
                        <span className="stat-label">Resolved Issues</span>
                      </div>
                    </div>
                  </div>
                  <div className="lecturer-actions">
                    <button className="action-button">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "help":
        return (
          <div className="help-view">
            <h2>Help &amp; Support</h2>
            <p>If you run into any issues, please:</p>
            <ul>
              <li>Email: support@mak.ac.ug</li>
              <li>Call: +256 414 123456</li>
              <li>Visit: Room 101, CIT Building</li>
            </ul>
          </div>
        );

        
      default:
        return (
          <div className="dashboard-overview">
            <h2>Welcome, {registrarProfile.full_name || "Registrar"}</h2>
            <div className="stats-cards">
              <div className="stat-card">
                <h3>Total Issues</h3>
                <p>{stats.total}</p>
              </div>
              <div className="stat-card">
                <h3>Open</h3>
                <p>{stats.open}</p>
              </div>
              <div className="stat-card">
                <h3>In Progress</h3>
                <p>{stats.inProgress}</p>
              </div>
              <div className="stat-card">
                <h3>Resolved</h3>
                <p>{stats.resolved}</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout userRole="Registrar" profile={registrarProfile}>
      <div className="registrar-dashboard">{renderContent()}</div>

      {showIssueDetailModal && selectedIssue && (
        <IssueDetail
          issue={selectedIssue}
          onClose={() => setShowIssueDetailModal(false)}
          onStatusChange={handleStatusChange}
          onAddComment={handleAddComment}
          userRole="Registrar"
        />
      )}

      {showAssignModal && (
        <div className="modal-overlay">
          <div className="assign-modal">
            <h3>Assign to Lecturer</h3>
            <select
              value={selectedLecturer || ""}
              onChange={(e) => setSelectedLecturer(Number(e.target.value))}
            >
              <option value="" disabled>
                — Select lecturer —
              </option>
              {lecturers.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.department})
                </option>
              ))}
            </select>
            <div className="modal-actions">
              <button onClick={handleAssignIssue}>Assign</button>
              <button onClick={() => setShowAssignModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default RegistrarDashboard;
