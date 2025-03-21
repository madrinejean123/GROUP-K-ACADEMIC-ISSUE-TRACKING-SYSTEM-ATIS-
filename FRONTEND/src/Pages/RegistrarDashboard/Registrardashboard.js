import { useState, useEffect } from "react";
import DashboardLayout from "../../Components/layout/DashboardLayout";
import IssueList from "../../Components/issues/IssueList";
import IssueDetail from "../../Components/issues/IssueDetail";
import { mockIssues } from "../../mock-data";
import "./registrar-dashboard.css";

const RegistrarDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showIssueDetailModal, setShowIssueDetailModal] = useState(false);
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

  // Load issues with student information
  useEffect(() => {
    // API call here
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
  }, []);

  
  useEffect(() => {
    
    const handleSidebarNav = (event) => {
      if (event.detail && event.detail.navItem) {
        setActiveView(event.detail.navItem);
      }
    };

    // Add event listener
    window.addEventListener("sidebarNavigation", handleSidebarNav);

    // Clean up
    return () => {
      window.removeEventListener("sidebarNavigation", handleSidebarNav);
    };
  }, []);

  const handleViewIssue = (issue) => {
    setSelectedIssue(issue);
    setShowIssueDetailModal(true);
  };

  const handleStatusChange = (action) => {
    if (action === "assign") {
      setShowAssignModal(true);
    } else {
      const updatedIssues = issues.map((issue) =>
        issue.id === selectedIssue.id ? { ...issue, status: action } : issue
      );
      setIssues(updatedIssues);
      setSelectedIssue({ ...selectedIssue, status: action });
    }
  };

  const handleAddComment = (comment) => {
    const newComment = {
      author: "Registrar",
      date: new Date().toISOString().split("T")[0],
      content: comment,
    };

    const updatedIssue = {
      ...selectedIssue,
      comments: [...(selectedIssue.comments || []), newComment],
    };

    const updatedIssues = issues.map((issue) =>
      issue.id === selectedIssue.id ? updatedIssue : issue
    );

    setIssues(updatedIssues);
    setSelectedIssue(updatedIssue);
  };

  const handleAssignIssue = () => {
    if (!selectedLecturer) return;

    const lecturer = lecturers.find((l) => l.id === selectedLecturer);

    const updatedIssues = issues.map((issue) =>
      issue.id === selectedIssue.id
        ? {
            ...issue,
            status: "In Progress",
            assignee: lecturer.name,
          }
        : issue
    );

    // Update lecturer's assigned issues count
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
    openIssues: issues.filter((issue) => issue.status === "Open").length,
    inProgressIssues: issues.filter((issue) => issue.status === "In Progress")
      .length,
    resolvedIssues: issues.filter(
      (issue) => issue.status === "Resolved" || issue.status === "Closed"
    ).length,
  };

  // Filter issues for assigned view
  const assignedIssues = issues.filter((issue) => issue.assignee);

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
                              (issue) =>
                                issue.assignee === lecturer.name &&
                                (issue.status === "Resolved" ||
                                  issue.status === "Closed")
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
            <div className="help-content">
              <div className="help-section">
                <h3>Getting Started</h3>
                <p>
                  Welcome to the Registrar Dashboard. This dashboard helps you
                  manage and assign student issues to appropriate lecturers.
                </p>
                <ul>
                  <li>
                    <strong>All Issues:</strong> View all student issues in the
                    system
                  </li>
                  <li>
                    <strong>Assigned Issues:</strong> View issues that have been
                    assigned to lecturers
                  </li>
                  <li>
                    <strong>Lecturers:</strong> View and manage lecturer
                    information
                  </li>
                </ul>
              </div>
              <div className="help-section">
                <h3>Managing Issues</h3>
                <p>To assign an issue to a lecturer:</p>
                <ol>
                  <li>Click on "View" for any open issue</li>
                  <li>Click "Assign to Lecturer" in the issue details</li>
                  <li>Select a lecturer from the list</li>
                  <li>Click "Assign Issue"</li>
                </ol>
              </div>
              <div className="help-section">
                <h3>Need Further Assistance?</h3>
                <p>
                  Contact the system administrator at{" "}
                  <a href="mailto:admin@university.edu">admin@university.edu</a>
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <>
            <div className="welcome-section">
              <div className="welcome-text">
                <h2>Welcome, Registrar!</h2>
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
    <DashboardLayout userRole="Registrar">
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
          <div className="assign-modal">
            <div className="modal-header">
              <h2>Assign Issue to Lecturer</h2>
              <button
                className="close-modal-button"
                onClick={() => setShowAssignModal(false)}
              >
                ×
              </button>
            </div>
            <div className="assign-content">
              <p>
                Select a lecturer to assign issue #{selectedIssue.id}:{" "}
                {selectedIssue.title}
              </p>
              <div className="lecturer-selection">
                {lecturers.map((lecturer) => (
                  <div
                    key={lecturer.id}
                    className={`lecturer-option ${
                      selectedLecturer === lecturer.id ? "selected" : ""
                    }`}
                    onClick={() => setSelectedLecturer(lecturer.id)}
                  >
                    <div className="lecturer-option-info">
                      <h4>{lecturer.name}</h4>
                      <p>{lecturer.department}</p>
                    </div>
                    <div className="lecturer-option-stats">
                      <span>{lecturer.assignedIssues} issues assigned</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="form-actions">
              <button
                className="cancel-button"
                onClick={() => setShowAssignModal(false)}
              >
                Cancel
              </button>
              <button
                className="submit-button"
                onClick={handleAssignIssue}
                disabled={!selectedLecturer}
              >
                Assign Issue
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default RegistrarDashboard;
