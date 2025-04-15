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
  const [lecturers, setLecturers] = useState([
    { id: 1, name: "Dr. Jane Doe", department: "Computer Science", assignedIssues: 3 },
    { id: 2, name: "Prof. Michael Mutebi", department: "Mathematics", assignedIssues: 5 },
    { id: 3, name: "Dr. Sarah Williams", department: "Engineering", assignedIssues: 2 },
    { id: 4, name: "Prof. Robert Kato", department: "Physics", assignedIssues: 0 },
  ]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [activeView, setActiveView] = useState("dashboard");
  const [registrarProfile, setRegistrarProfile] = useState({});

  // Fetch registrar profile
  useEffect(() => {
    const fetchRegistrarProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return console.error("No access token found");

        const response = await axios.get(
          "https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/users/profile/",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const profileData = Array.isArray(response.data) ? response.data[0] : response.data;
        setRegistrarProfile(profileData);
      } catch (error) {
        console.error("Error fetching registrar profile:", error);
      }
    };
    fetchRegistrarProfile();
  }, []);

  // 📌 Fetch real issues from backend
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return console.error("No access token found");

        const { data } = await axios.get(
          "https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/issues/list/",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setIssues(data);
      } catch (error) {
        console.error("Error fetching issues:", error);
      }
    };
    fetchIssues();
  }, []);

  // Sidebar navigation listener
  useEffect(() => {
    const handleSidebarNav = (event) => {
      if (event.detail?.navItem) setActiveView(event.detail.navItem);
    };
    window.addEventListener("sidebarNavigation", handleSidebarNav);
    return () => window.removeEventListener("sidebarNavigation", handleSidebarNav);
  }, []);

  // … rest of your handlers (view, status change, comments, assign) stay unchanged …

  // Stats & filtered subsets
  const stats = {
    totalIssues: issues.length,
    openIssues: issues.filter((i) => i.status === "Open").length,
    inProgressIssues: issues.filter((i) => i.status === "In Progress").length,
    resolvedIssues: issues.filter((i) => ["Resolved", "Closed"].includes(i.status)).length,
  };
  const assignedIssues = issues.filter((i) => i.assignee);

  // Render based on activeView …
  const renderContent = () => {
    // … exactly as before …
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
          {/* … assign modal unchanged … */}
        </div>
      )}
    </DashboardLayout>
  );
};

export default RegistrarDashboard;
