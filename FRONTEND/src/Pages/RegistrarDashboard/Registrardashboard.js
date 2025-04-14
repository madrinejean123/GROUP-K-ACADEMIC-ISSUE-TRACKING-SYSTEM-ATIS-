"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../../Components/layout/DashboardLayout";
import IssueList from "../../Components/issues/IssueList";
import IssueDetail from "../../Components/issues/IssueDetail";
import { mockIssues } from "../../mock-data";
import "./registrar-dashboard.css";
import axios from "axios"; // 📌 ADDED

const RegistrarDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showIssueDetailModal, setShowIssueDetailModal] = useState(false);
  // API to fetch lecturers here
  const [lecturers, setLecturers] = useState([
    {
      id: 1,
      name: "Dr. Jane Doe",
      department: "Computer Science",
      assignedIssues: 3,
    },
    {
      id: 2,
      name: "Prof. Michael Mutebi",
      department: "Mathematics",
      assignedIssues: 5,
    },
    {
      id: 3,
      name: "Dr. Sarah Williams",
      department: "Engineering",
      assignedIssues: 2,
    },
    {
      id: 4,
      name: "Prof. Robert Kato",
      department: "Physics",
      assignedIssues: 0,
    },
  ]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [activeView, setActiveView] = useState("dashboard");
  const [registrarProfile, setRegistrarProfile] = useState({}); // 📌 NEW

  // 📌 Fetch the registrar's full profile from the backend
  useEffect(() => {
    const fetchRegistrarProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return console.error("No access token found");

        const response = await axios.get(
          "https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/users/profile/",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = response.data;
        const profileData = Array.isArray(data) ? data[0] : data;
        setRegistrarProfile(profileData);
      } catch (error) {
        console.error("Error fetching registrar profile:", error);
      }
    };

    fetchRegistrarProfile();
  }, []);

  // Load issues with student information
  useEffect(() => {
    const enhancedIssues = mockIssues.map((issue) => ({
      ...issue,
      student: "John Doe",
      studentId: "STD" + Math.floor(Math.random() * 10000),
      assignee:
        issue.status !== "Open"
          ? lecturers[Math.floor(Math.random() * lecturers.length)].name
          : null,
    }));
    setIssues(enhancedIssues);
  }, [lecturers]);

  // Listen for sidebar navigation events
  useEffect(() => {
    const handleSidebarNav = (event) => {
      if (event.detail && event.detail.navItem) {
        setActiveView(event.detail.navItem);
      }
    };
    window.addEventListener("sidebarNavigation", handleSidebarNav);
    return () =>
      window.removeEventListener("sidebarNavigation", handleSidebarNav);
  }, []);

  const handleViewIssue = (issue) => {
    setSelectedIssue(issue);
    setShowIssueDetailModal(true);
  };

  const handleStatusChange = (action) => {
    if (action === "assign") {
      setShowAssignModal(true);
    } else {
      const updated = issues.map((i) =>
        i.id === selectedIssue.id ? { ...i, status: action } : i
      );
      setIssues(updated);
      setSelectedIssue({ ...selectedIssue, status: action });
    }
  };

  const handleAddComment = (comment) => {
    const newComment = {
      author: registrarProfile.full_name || "Registrar",
      date: new Date().toISOString().split("T")[0],
      content: comment,
    };
    const updatedIssue = {
      ...selectedIssue,
      comments: [...(selectedIssue.comments || []), newComment],
    };
    setIssues(issues.map((i) => (i.id === updatedIssue.id ? updatedIssue : i)));
    setSelectedIssue(updatedIssue);
  };

  const handleAssignIssue = () => {
    if (!selectedLecturer) return;
    const lecturer = lecturers.find((l) => l.id === selectedLecturer);
    const updatedIssues = issues.map((i) =>
      i.id === selectedIssue.id
        ? { ...i, status: "In Progress", assignee: lecturer.name }
        : i
    );
    const updatedLecturers = lecturers.map((l) =>
      l.id === selectedLecturer
        ? { ...l, assignedIssues: l.assignedIssues + 1 }
        : l
    );
    setIssues(updatedIssues);
    setLecturers(updatedLecturers);
    setSelectedIssue({
      ...selectedIssue,
      status: "In Progress",
      assignee: lecturer.name,
    });
    setShowAssignModal(false);
    setSelectedLecturer(null);
  };

  // Dashboard stats
  const stats = {
    totalIssues: issues.length,
    openIssues: issues.filter((i) => i.status === "Open").length,
    inProgressIssues: issues.filter((i) => i.status === "In Progress").length,
    resolvedIssues: issues.filter((i) =>
      ["Resolved", "Closed"].includes(i.status)
    ).length,
  };

  const assignedIssues = issues.filter((i) => i.assignee);

  // Render content based on active view
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
                        <span className="stat-value">
                          {lecturer.assignedIssues}
                        </span>
                        <span className="stat-label">Assigned Issues</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">
                          {
                            issues.filter(
                              (i) =>
                                i.assignee === lecturer.name &&
                                ["Resolved", "Closed"].includes(i.status)
                            ).length
                          }
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
            <h2>Help & Support</h2>
            {/* ... help content unchanged ... */}
          </div>
        );
      default:
        return (
          <>
            <div className="welcome-section">
              <div className="welcome-text">
                <h2>
                  Welcome,{" "}
                  {registrarProfile.full_name
                    ? registrarProfile.full_name
                    : "Registrar"}
                  !
                </h2>
                <p>
                  Manage and assign student issues to appropriate lecturers.
                </p>
              </div>
              <div className="stats-cards">
                <div className="stat-card">
                  <div className="stat-value">{stats.totalIssues}</div>
                  <div className="stat-label">Total Issues</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.openIssues}</div>
                  <div className="stat-label">Open Issues</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.inProgressIssues}</div>
                  <div className="stat-label">In Progress</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.resolvedIssues}</div>
                  <div className="stat-label">Resolved</div>
                </div>
              </div>
            </div>

            <div className="dashboard-sections">
              <div className="main-section">
                <IssueList
                  issues={issues}
                  title="All Student Issues"
                  showCreateButton={false}
                  onViewIssue={handleViewIssue}
                  userRole="Registrar"
                />
              </div>
              <div className="side-section">
                <div className="lecturers-section">
                  <h3>Lecturers</h3>
                  <div className="lecturers-list">
                    {lecturers.map((lecturer) => (
                      <div key={lecturer.id} className="lecturer-card">
                        <div className="lecturer-info">
                          <h4>{lecturer.name}</h4>
                          <p>{lecturer.department}</p>
                        </div>
                        <div className="lecturer-stats">
                          <span className="assigned-count">
                            {lecturer.assignedIssues}
                          </span>
                          <span className="assigned-label">Assigned</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <DashboardLayout userRole="Registrar" profile={registrarProfile}>
      {" "}
      {/* 📌 PASS profile */}
      <div className="registrar-dashboard">{renderContent()}</div>
      {/* Issue Detail Modal */}
      {showIssueDetailModal && selectedIssue && (
        <IssueDetail
          issue={selectedIssue}
          onClose={() => setShowIssueDetailModal(false)}
          onStatusChange={handleStatusChange}
          onAddComment={handleAddComment}
          userRole="Registrar"
        />
      )}
      {/* Assign Issue Modal */}
      {showAssignModal && (
        <div className="modal-overlay">
          {/* ... assign modal unchanged ... */}
        </div>
      )}
    </DashboardLayout>
  );
};

export default RegistrarDashboard;
