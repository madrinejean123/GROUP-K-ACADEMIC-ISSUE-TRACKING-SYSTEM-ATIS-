"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../../Components/layout/DashboardLayout";
import IssueList from "../../Components/issues/IssueList";
import IssueDetail from "../../Components/issues/IssueDetail";
import "./registrar-dashboard.css";
import axios from "axios";

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

  // Fetch all the issues
  useEffect(() => {
    async function fetchIssues() {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      try {
        const { data } = await axios.get(
          "https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/issues/list/",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const withAssignees = data.map((i) => ({
          ...i,
          assignee: i.assigned_lecturer?.user.full_name || null,
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
          "https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/users/users/lecturers/",
          { headers: { Authorization: `Bearer ${token}` } }
        );
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
    setIssues((prev) =>
      prev.map((i) =>
        i.id === issueId
          ? { ...i, assignee: lecturerName, assigneeId: lecturerId }
          : i
      )
    );
    if (selectedIssue?.id === issueId) {
      setSelectedIssue((prev) => ({
        ...prev,
        assignee: lecturerName,
        assigneeId: lecturerId,
      }));
    }
  };

  // Stats  & filters
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
    ...l,
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
          <div className="lecturers-view">
            <h2>Lecturers</h2>
            {lecturerCounts.map((l) => (
              <div key={l.id} className="lecturer-card-full">
                <h3>{l.name}</h3>
                <p>{l.count} assigned issues</p>
              </div>
            ))}
          </div>
        );

      case "help":
        return (
          <div className="help-view">
            <h2>Help & Support</h2>
            <ul>
              <li>Email: support@mak.ac.ug</li>
              <li>Call: +256 414 123456</li>
              <li>Visit: Room 101, CIT Building</li>
            </ul>
          </div>
        );

      default:
        return (
          <div className="dashboard-overview">
            <div className="welcome-banner">
              <h2>
                {getGreeting()}, {registrarProfile.full_name || "Registrar"} !
              </h2>
              <p>
                Welcome to Makerere University Academic Issue Tracker. <br />
                Manage and assign student issues to appropriate lecturers here.
              </p>
            </div>
            
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
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
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
          onAssign={handleAssign}
          userRole="Registrar"
          lecturers={lecturers}
        />
      )}
    </DashboardLayout>
  );
};

export default RegistrarDashboard;
