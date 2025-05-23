import { useState, useEffect } from "react";
import Header from "../../Components/layout/Header";
import Sidebar from "../../Components/layout/Sidebar";
import IssueDetail from "../../Components/issues/IssueDetail";
import { ToastContainer, toast } from "react-toastify";

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
  const [activeTab, setActiveTab] = useState("dashboard");
  const [resolvingIssueId, setResolvingIssueId] = useState(null);
  const [noteIssueId, setNoteIssueId] = useState(null);
  const [noteText, setNoteText] = useState("");

  // Listen for sidebar navigation events
  useEffect(() => {
    const handleSidebarNavigation = (event) => {
      const { navItem } = event.detail;
      setActiveTab(navItem);
    };

    window.addEventListener("sidebarNavigation", handleSidebarNavigation);

    return () => {
      window.removeEventListener("sidebarNavigation", handleSidebarNavigation);
    };
  }, []);

  // Fetch the lecturer profile
  useEffect(() => {
    const fetchLecturerProfile = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      try {
        const { data } = await axios.get(PROFILE_API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLecturerProfile(Array.isArray(data) ? data[0] : data);
      } catch (err) {
        console.error("Error fetching profile", err);
      }
    };
    fetchLecturerProfile();
  }, []);

  // Fetch the issues once profile is loaded
  useEffect(() => {
    if (!lecturerProfile.id) return;
    const fetchIssues = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      try {
        const { data } = await axios.get(ALL_ISSUES_API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIssues(data);
      } catch (err) {
        console.error("Error fetching issues", err);
      }
    };
    fetchIssues();
  }, [lecturerProfile]);

  // Show inline input for resolution notes
  const handleResolve = (issueId) => {
    setNoteIssueId(issueId);
    setNoteText("");
  };

  const handleCancelResolution = () => {
    setNoteIssueId(null);
    setNoteText("");
  };

  const handleSubmitResolution = async (issueId) => {
    if (noteText.trim() === "") {
      toast.error("Resolution notes cannot be empty.");
      return;
    }
    setResolvingIssueId(issueId);
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setIssues((prev) =>
          prev.map((i) =>
            i.id === issueId
              ? { ...i, status: "Resolved", resolution_notes: noteText }
              : i
          )
        );

        toast.success("Issue resolved successfully!");
        setResolvingIssueId(null);
        setNoteIssueId(null);
        setNoteText("");
        return;
      }

      const payload = { status: "resolved", resolution_notes: noteText };
      await axios.patch(`${UPDATE_STATUS_API_URL}${issueId}/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIssues((prev) =>
        prev.map((i) =>
          i.id === issueId
            ? { ...i, status: "Resolved", resolution_notes: noteText }
            : i
        )
      );

      toast.success("Issue resolved successfully!");
    } catch (err) {
      console.error("Error resolving issue", err);
      toast.error("Failed to resolve issue. Please try again.");
    } finally {
      setResolvingIssueId(null);
      setNoteIssueId(null);
      setNoteText("");
    }
  };

  // Open detail modal
  const handleViewIssue = (issue) => {
    setSelectedIssue(issue);
    setShowIssueDetailModal(true);
  };

  // Callback for detail modal status change
  const handleStatusChange = (newStatus, notes = null) => {
    setIssues((all) =>
      all.map((i) =>
        i.id === selectedIssue.id
          ? {
              ...i,
              status: newStatus,
              resolution_notes: notes ?? i.resolution_notes,
            }
          : i
      )
    );
    setSelectedIssue((i) => ({
      ...i,
      status: newStatus,
      resolution_notes: notes ?? i.resolution_notes,
    }));
  };

  // Add comment locally
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

  // Filtering and the stats
  const normalize = (s) => s.replace(/_/g, " ").toLowerCase();

  const assignedIssues = issues.filter((i) => {
    const st = normalize(i.status);
    return st === "open" || st === "in progress";
  });

  const resolvedIssues = issues.filter((i) => {
    const st = normalize(i.status);
    return st === "resolved" || st === "closed";
  });

  const stats = {
    assigned: assignedIssues.length,
    resolved: resolvedIssues.length,
    students: new Set(issues.map((i) => i.author?.user?.id || i.id)).size,
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="dashboard-content">
            {/* Welcome Section */}
            <div className="welcome-section">
              <div className="welcome-banner">
                <h2>
                  {getGreeting()}, Dr. {lecturerProfile.full_name || "Lecturer"}{" "}
                  !
                </h2>
                <p>
                  Welcome to Makerere University Academic Issue Tracker. <br />
                  Manage and resolve assigned student academic related issues
                  here.
                </p>
              </div>

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

            {/* Tabs Container */}
            <div className="tabs-container">
              <button
                className={activeTab === "dashboard" ? "tab active" : "tab"}
                onClick={() => setActiveTab("dashboard")}
              >
                Dashboard
              </button>
              <button
                className={activeTab === "assigned" ? "tab active" : "tab"}
                onClick={() => setActiveTab("assigned")}
              >
                Assigned Issues
              </button>
              <button
                className={activeTab === "resolved" ? "tab active" : "tab"}
                onClick={() => setActiveTab("resolved")}
              >
                Resolved Issues
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
                            className={`status-badge status-${normalize(
                              issue.status
                            ).replace(" ", "-")}`}
                          >
                            {normalize(issue.status)}
                          </span>
                        </td>
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
                      <td colSpan="6">No issues to display.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "assigned":
        return (
          <div className="assigned-content">
            <h3>Assigned Issues</h3>
            <div className="issues-table-container">
              <table className="issues-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Submitted At</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedIssues.length > 0 ? (
                    assignedIssues.map((issue) => (
                      <tr key={issue.id}>
                        <td>#{issue.id}</td>
                        <td>{issue.title}</td>
                        <td>{issue.description}</td>
                        <td>{new Date(issue.created_at).toLocaleString()}</td>
                        <td>
                          <span
                            className={`status-badge status-${normalize(
                              issue.status
                            ).replace(" ", "-")}`}
                          >
                            {normalize(issue.status)}
                          </span>
                        </td>
                        <td>
                          {noteIssueId === issue.id ? (
                            <div className="resolution-input">
                              <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Enter resolution notes"
                              />
                              <div className="resolution-actions">
                                <button
                                  className="submit-button"
                                  onClick={() =>
                                    handleSubmitResolution(issue.id)
                                  }
                                  disabled={resolvingIssueId === issue.id}
                                >
                                  {resolvingIssueId === issue.id
                                    ? "Resolving..."
                                    : "Done"}
                                </button>
                                <button
                                  className="cancel-button"
                                  onClick={handleCancelResolution}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="action-buttons">
                              <button
                                className="action-button"
                                onClick={() => handleViewIssue(issue)}
                              >
                                View
                              </button>
                              <button
                                className="action-button resolve-button"
                                onClick={() => handleResolve(issue.id)}
                                disabled={resolvingIssueId === issue.id}
                              >
                                {resolvingIssueId === issue.id
                                  ? "Resolving..."
                                  : "Resolve"}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">No assigned issues to display.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "resolved":
        return (
          <div className="resolved-content">
            <h3>Resolved Issues</h3>
            <div className="issues-table-container">
              <table className="issues-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Submitted At</th>
                    <th>Status</th>
                    <th>Resolution Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resolvedIssues.length > 0 ? (
                    resolvedIssues.map((issue) => (
                      <tr key={issue.id}>
                        <td>#{issue.id}</td>
                        <td>{issue.title}</td>
                        <td>{issue.description}</td>
                        <td>{new Date(issue.created_at).toLocaleString()}</td>
                        <td>
                          <span
                            className={`status-badge status-${normalize(
                              issue.status
                            ).replace(" ", "-")}`}
                          >
                            {normalize(issue.status)}
                          </span>
                        </td>
                        <td>{issue.resolution_notes || "No notes provided"}</td>
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
                      <td colSpan="7">No resolved issues to display.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return (
          <div className="dashboard-content">
            <h2>Page Not Found</h2>
            <p>The requested page could not be found.</p>
          </div>
        );
    }
  };

  return (
    <div className="lecturer-dashboard">
      <ToastContainer />
      {/* Header */}
      <Header
        toggleSidebar={() => {}}
        isMobile={false}
        sidebarOpen={false}
        userRole="Lecturer"
        profile={lecturerProfile}
      />

      {/* Layout */}
      <div className="dashboard-layout">
        {/* Sidebar - Using the existing sidebar component */}
        <Sidebar
          sidebarOpen={true}
          userRole="Lecturer"
          profile={lecturerProfile}
          activeTab={activeTab}
          onNavigate={(tab) => setActiveTab(tab)}
        />

        {/* Main Content */}
        <div className="dashboard-main-content">
          {/* Dynamic Content Based on Active Tab */}
          {renderContent()}

          {/* Issue Detail Modal */}
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
      </div>
    </div>
  );
};

export default LecturerDashboard;

// const PROFILE_API_URL =
//   "https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/users/profile/";
// const ALL_ISSUES_API_URL =
//   "https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/issues/list/";
// const UPDATE_STATUS_API_URL =
//   "https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/issues/update-status/";

// const LecturerDashboard = () => {
//   const [lecturerProfile, setLecturerProfile] = useState({});
//   const [issues, setIssues] = useState([]);
//   const [selectedIssue, setSelectedIssue] = useState(null);
//   const [showIssueDetailModal, setShowIssueDetailModal] = useState(false);
//   const [activeTab, setActiveTab] = useState("assigned");
//   const [resolvingIssueId, setResolvingIssueId] = useState(null);
//   const [noteIssueId, setNoteIssueId] = useState(null);
//   const [noteText, setNoteText] = useState("");

//   // Fetch the lecturer profile
//   useEffect(() => {
//     const fetchLecturerProfile = async () => {
//       const token = localStorage.getItem("access_token");
//       if (!token) return;
//       try {
//         const { data } = await axios.get(PROFILE_API_URL, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setLecturerProfile(Array.isArray(data) ? data[0] : data);
//       } catch (err) {
//         console.error("Error fetching profile", err);
//       }
//     };
//     fetchLecturerProfile();
//   }, []);

//   // Fetch the issues once profile is loaded
//   useEffect(() => {
//     if (!lecturerProfile.id) return;
//     const fetchIssues = async () => {
//       const token = localStorage.getItem("access_token");
//       if (!token) return;
//       try {
//         const { data } = await axios.get(ALL_ISSUES_API_URL, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setIssues(data);
//       } catch (err) {
//         console.error("Error fetching issues", err);
//       }
//     };
//     fetchIssues();
//   }, [lecturerProfile]);

//   // Show inline input for resolution notes
//   const handleResolve = (issueId) => {
//     setNoteIssueId(issueId);
//     setNoteText("");
//   };

//   const handleCancelResolution = () => {
//     setNoteIssueId(null);
//     setNoteText("");
//   };

//   const handleSubmitResolution = async (issueId) => {
//     if (noteText.trim() === "") {
//       alert("Resolution notes cannot be empty.");
//       return;
//     }
//     setResolvingIssueId(issueId);
//     try {
//       const token = localStorage.getItem("access_token");
//       const payload = { status: "resolved", resolution_notes: noteText };
//       await axios.patch(`${UPDATE_STATUS_API_URL}${issueId}/`, payload, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setIssues((prev) =>
//         prev.map((i) =>
//           i.id === issueId
//             ? { ...i, status: "resolved", resolution_notes: noteText }
//             : i
//         )
//       );
//     } catch (err) {
//       console.error("Error resolving issue", err);
//     } finally {
//       setResolvingIssueId(null);
//       setNoteIssueId(null);
//       setNoteText("");
//     }
//   };

//   // Open  detail modal
//   const handleViewIssue = (issue) => {
//     setSelectedIssue(issue);
//     setShowIssueDetailModal(true);
//   };

//   // Callback for detail modal status change
//   const handleStatusChange = (newStatus, notes = null) => {
//     setIssues((all) =>
//       all.map((i) =>
//         i.id === selectedIssue.id
//           ? {
//               ...i,
//               status: newStatus,
//               resolution_notes: notes ?? i.resolution_notes,
//             }
//           : i
//       )
//     );
//     setSelectedIssue((i) => ({
//       ...i,
//       status: newStatus,
//       resolution_notes: notes ?? i.resolution_notes,
//     }));
//   };

//   // Add comment locally
//   const handleAddComment = (commentText) => {
//     const newComment = {
//       author: `Dr. ${lecturerProfile.full_name}`,
//       date: new Date().toISOString().split("T")[0],
//       content: commentText,
//     };
//     setIssues((all) =>
//       all.map((i) =>
//         i.id === selectedIssue.id
//           ? { ...i, comments: [...(i.comments || []), newComment] }
//           : i
//       )
//     );
//     setSelectedIssue((i) => ({
//       ...i,
//       comments: [...(i.comments || []), newComment],
//     }));
//   };

//   // Filtering and the stats
//   const normalize = (s) => s.replace(/_/g, " ").toLowerCase();
//   const assignedIssues = issues.filter((i) => {
//     const st = normalize(i.status);
//     return st === "open" || st === "in progress";
//   });
//   const resolvedIssues = issues.filter((i) => {
//     const st = normalize(i.status);
//     return st === "resolved" || st === "closed";
//   });
//   const filteredIssues =
//     activeTab === "assigned" ? assignedIssues : resolvedIssues;
//   const stats = {
//     assigned: assignedIssues.length,
//     resolved: resolvedIssues.length,
//     students: new Set(issues.map((i) => i.author.user.id)).size,
//   };
//   const getGreeting = () => {
//     const hour = new Date().getHours();
//     if (hour < 12) return "Good morning";
//     if (hour < 18) return "Good afternoon";
//     return "Good evening";
//   };
//   return (
//     <DashboardLayout userRole="Lecturer" profile={lecturerProfile}>
//       <div className="lecturer-dashboard">
//         {/* Welcome & Stats */}
//         <div className="welcome-section">
//           <div className="welcome-banner">
//             <h2>
//               {getGreeting()}, Dr. {lecturerProfile.full_name || "Lecturer"} !
//             </h2>
//             <p>
//               Welcome to Makerere University Academic Issue Tracker. <br />
//               Manage and resolve assigned student academic related issues here.
//             </p>
//           </div>
//           <div className="stats-cards">
//             <div className="stat-card">
//               <div className="stat-value">{stats.assigned}</div>
//               <div className="stat-label">Assigned</div>
//             </div>
//             <div className="stat-card">
//               <div className="stat-value">{stats.resolved}</div>
//               <div className="stat-label">Resolved</div>
//             </div>
//             <div className="stat-card">
//               <div className="stat-value">{stats.students}</div>
//               <div className="stat-label">Students</div>
//             </div>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="tabs-container">
//           <button
//             className={activeTab === "assigned" ? "tab active" : "tab"}
//             onClick={() => setActiveTab("assigned")}
//           >
//             Assigned
//           </button>
//           <button
//             className={activeTab === "resolved" ? "tab active" : "tab"}
//             onClick={() => setActiveTab("resolved")}
//           >
//             Resolved
//           </button>
//         </div>

//         {/* Issues Table */}
//         <div className="issues-table-container">
//           <table className="issues-table">
//             <thead>
//               <tr>
//                 <th>ID</th>
//                 <th>Title</th>
//                 <th>Description</th>
//                 <th>Submitted At</th>
//                 <th>Status</th>
//                 {activeTab === "assigned" && <th>Actions</th>}
//               </tr>
//             </thead>
//             <tbody>
//               {filteredIssues.length > 0 ? (
//                 filteredIssues.map((issue) => (
//                   <tr key={issue.id}>
//                     <td>#{issue.id}</td>
//                     <td>{issue.title}</td>
//                     <td>{issue.description}</td>
//                     <td>{new Date(issue.created_at).toLocaleString()}</td>
//                     <td>{normalize(issue.status)}</td>
//                     {activeTab === "assigned" && (
//                       <td>
//                         {noteIssueId === issue.id ? (
//                           <div className="resolution-input">
//                             <textarea
//                               value={noteText}
//                               onChange={(e) => setNoteText(e.target.value)}
//                               placeholder="Enter resolution notes"
//                             />
//                             <button
//                               onClick={() => handleSubmitResolution(issue.id)}
//                               disabled={resolvingIssueId === issue.id}
//                             >
//                               Done
//                             </button>
//                             <button onClick={handleCancelResolution}>
//                               Cancel
//                             </button>
//                           </div>
//                         ) : (
//                           <button
//                             className="action-button"
//                             onClick={() => handleResolve(issue.id)}
//                             disabled={resolvingIssueId === issue.id}
//                           >
//                             {resolvingIssueId === issue.id
//                               ? "Resolving..."
//                               : "Resolve"}
//                           </button>
//                         )}
//                       </td>
//                     )}
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={activeTab === "assigned" ? 6 : 5}>
//                     No issues to display.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Details Modal */}
//         {showIssueDetailModal && selectedIssue && (
//           <IssueDetail
//             issue={selectedIssue}
//             onClose={() => setShowIssueDetailModal(false)}
//             onStatusChange={handleStatusChange}
//             onAddComment={handleAddComment}
//             userRole="Lecturer"
//           />
//         )}
//       </div>
//     </DashboardLayout>
//   );
// };

// export default LecturerDashboard;
