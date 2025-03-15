import React, { useState, useEffect } from "react";
import "./dashboard.css";

const issuesData = [
  {
    id: 1,
    category: "Missing Marks",
    courseUnit: "Operating systems",
    dateRaised: "2025-02-15",
    status: "Pending",
  },
  {
    id: 2,
    category: "Appeal for regrading",
    courseUnit: "Data structures &Algorithms",
    dateRaised: "2025-02-10",
    status: "In Progress",
  },
  {
    id: 3,
    category: "Incorrect marks",
    courseUnit: "System analysis &Design",
    dateRaised: "2025-02-05",
    status: "Resolved",
  },
  {
    id: 4,
    category: "Missing Marks",
    courseUnit: "Computer literacy",
    dateRaised: "2025-01-28",
    status: "Resolved",
  },
];

// Function to get status class based on status value
const getStatusClass = (status) => {
  switch (status) {
    case "Pending":
      return "status-pending";
    case "In Progress":
      return "status-progress";
    case "Resolved":
      return "status-resolved";
    default:
      return "";
  }
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [issues, setIssues] = useState(issuesData);

  useEffect(() => {
    // Any side effects can be managed here
  }, []);

  const handleTabChange = (tab) => setActiveTab(tab);

  const handleViewIssue = (id) => {
    const issue = issues.find((issue) => issue.id === id);
    console.log("Viewing issue:", issue);
    // Implement view issue functionality here
  };

  const renderIssuesTable = () => (
    <tbody>
      {issues.map((issue) => (
        <tr key={issue.id}>
          <td>{issue.category}</td>
          <td>{issue.courseUnit}</td>
          <td>{issue.dateRaised}</td>
          <td>
            <span className={getStatusClass(issue.status)}>{issue.status}</span>
          </td>
          <td>
            <button onClick={() => handleViewIssue(issue.id)}>View</button>
          </td>
        </tr>
      ))}
    </tbody>
  );

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="header">
        <div className="container header-container">
          <div className="contact-info">
            <div className="contact-item">
              <span className="icon">📞</span>
              <span>Call us: 07775644332 (AITS)</span>
            </div>
            <div className="contact-item">
              <span className="icon">✉️</span>
              <span>Mail us: jasksj@gmail.com</span>
            </div>
          </div>
          <div className="user-actions">
            <button className="icon-button">🔔</button>
            <div className="user-avatar">JN</div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="main-nav">
        <div className="container nav-container">
          <div className="system-title">
            Makerere Academic Issue Tracking System
          </div>
          <div className="nav-buttons">
            <button className="nav-button">STUDENT</button>
            <button className="nav-button">HOME</button>
            <button className="nav-button">SERVICES</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <div className="container content-container">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="profile-card">
              <div className="profile-image-container">
                <div className="profile-image"></div>
              </div>
              <div className="profile-info">
                <div className="profile-name">John N</div>
                <div className="profile-details">Std No: 2400709341</div>
                <div className="profile-details">BSCS</div>
              </div>

              <div className="sidebar-nav">
                <button
                  className={`sidebar-nav-item ${
                    activeTab === "home" ? "active" : ""
                  }`}
                  onClick={() => handleTabChange("home")}
                >
                  <span className="icon">🏠</span>
                  <span>Home</span>
                </button>
                <button
                  className={`sidebar-nav-item ${
                    activeTab === "notification" ? "active" : ""
                  }`}
                  onClick={() => handleTabChange("notification")}
                >
                  <span className="icon">🔔</span>
                  <span>Notification</span>
                </button>
                <button
                  className={`sidebar-nav-item ${
                    activeTab === "emails" ? "active" : ""
                  }`}
                  onClick={() => handleTabChange("emails")}
                >
                  <span className="icon">✉️</span>
                  <span>Emails</span>
                </button>
              </div>

              <button className="profile-button">EDIT PROFILE</button>
              <button className="profile-button">Contact support</button>
            </div>
          </aside>

          {/* Content Area */}
          <div className="content-area">
            <div className="welcome-card">
              <h1 className="welcome-title">HELLO JOHN N.!</h1>
              <p className="welcome-text">
                Track your academic-related issues here...
              </p>
            </div>

            <div className="issues-card">
              <div className="issues-header">
                <h2 className="issues-title">View Issues and Their Statuses</h2>
              </div>

              <div className="table-container">
                <table className="issues-table">
                  <thead>
                    <tr>
                      <th>Category of Complaint</th>
                      <th>Course Unit</th>
                      <th>Date Raised</th>
                      <th>Status</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  {renderIssuesTable()}
                </table>
              </div>

              <div className="issues-actions">
                <button className="new-issue-button">New Issue</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-container">
          <div className="copyright">
            @ 2025 Makerere University (AITS) All rights reserved
          </div>
          <div className="footer-links">
            <a href="#" className="footer-link">
              Privacy/Terms&Conditions/Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
