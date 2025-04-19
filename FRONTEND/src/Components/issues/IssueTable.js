import React, { useState } from "react";
import axios from "axios";
import "../styles/issue-table.css";

const IssueTable = ({ issues, onViewIssue, onAssign, userRole }) => {
  const [assigningIssueId, setAssigningIssueId] = useState(null);
  const [assignMessages, setAssignMessages] = useState({});
  const [resolveMessages, setResolveMessages] = useState({});
  const [lecturers, setLecturers] = useState([]);
  const [loadingLecturers, setLoadingLecturers] = useState(false);
  const [resolvingIssueId, setResolvingIssueId] = useState(null);

  // Use the raw status values for filtering, but display humanized headers
  const statuses = Array.from(new Set(issues.map((i) => i.status)));

  const columns = [
    { id: "id", label: "ID" },
    { id: "title", label: "Title" },
    { id: "description", label: "Description" },
    { id: "date", label: "Submitted At" },
    { id: "status", label: "Status" },
    ...(userRole === "Registrar"
      ? [
          { id: "author", label: "Submitted By" },
          { id: "assignee", label: "Assignee" },
        ]
      : userRole === "Lecturer"
      ? [{ id: "student", label: "Student" }]
      : []),
    { id: "actions", label: "Actions" },
    ...(userRole === "Lecturer" ? [{ id: "resolve", label: "Resolve" }] : []),
  ];

  const getStatusClass = (s) => {
    switch (s?.toLowerCase()) {
      case "open":
        return "status-open";
      case "in_progress":
      case "in progress":
        return "status-progress";
      case "resolved":
        return "status-resolved";
      case "closed":
        return "status-closed";
      default:
        return "status-default";
    }
  };

  const fetchLecturers = async () => {
    setLoadingLecturers(true);
    try {
      const token = localStorage.getItem("access_token");
      const { data } = await axios.get(
        "https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/users/users/lecturers/",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLecturers(data.map((l) => ({ id: l.id, name: l.user.full_name })));
    } catch (err) {
      console.error("Failed to fetch lecturers:", err);
    } finally {
      setLoadingLecturers(false);
    }
  };

  const handleAssignClick = async (issueId) => {
    await fetchLecturers();
    setAssigningIssueId(issueId);
  };

  const handleAssign = async (issueId, lecturerId) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No auth token");

      const { data } = await axios.post(
        `https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/issues/assign/${issueId}/`,
        { lecturer_id: lecturerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const selected = lecturers.find((l) => l.id === lecturerId);
      const fullName = selected?.name || "Assigned";

      onAssign(issueId, lecturerId, fullName);

      setAssignMessages((msgs) => ({
        ...msgs,
        [issueId]: data.message || "Assigned successfully",
      }));
    } catch (error) {
      console.error("Assign failed", error);
      setAssignMessages((msgs) => ({
        ...msgs,
        [issueId]: "Failed to assign. Please try again.",
      }));
    } finally {
      setAssigningIssueId(null);
    }
  };

  const handleResolve = async (issueId) => {
    setResolvingIssueId(issueId);
    setResolveMessages((msgs) => ({ ...msgs, [issueId]: null }));
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No auth token");

      const { data } = await axios.put(
        `https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/issues/update-status/${issueId}/`,
        { status: "resolved" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResolveMessages((msgs) => ({
        ...msgs,
        [issueId]: data.message || "Issue has been resolved successfully.",
      }));
    } catch (error) {
      console.error("Resolve failed", error);
      setResolveMessages((msgs) => ({
        ...msgs,
        [issueId]: "Failed to resolve issue.",
      }));
    } finally {
      setResolvingIssueId(null);
    }
  };

  return (
    <div className="issues-table-container">
      {statuses.map((status) => (
        <section key={status} className="status-group">
          {/* Humanize header: replace underscore and capitalize */}
          <h3>{status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</h3>
          <table className="issues-table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.id}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {issues
                .filter((i) => i.status === status)
                .map((issue) => (
                  <tr key={issue.id}>
                    {columns.map((c) => {
                      switch (c.id) {
                        case "id":
                          return <td key={c.id}>#{issue.id}</td>;
                        case "title":
                          return <td key={c.id}>{issue.title}</td>;
                        case "description":
                          return (
                            <td key={c.id} className="description-cell">
                              {issue.description}
                            </td>
                          );
                        case "date":
                          return (
                            <td key={c.id}>
                              {new Date(issue.created_at).toLocaleString()}
                            </td>
                          );
                        case "status":
                          return (
                            <td key={c.id}>
                              <span
                                className={`status-badge ${getStatusClass(
                                  issue.status
                                )}`}
                              >
                                {issue.status}
                              </span>
                            </td>
                          );
                        case "author":
                          return (
                            <td key={c.id}>
                              {issue.author.user.full_name}
                            </td>
                          );
                        case "assignee": {
                          const lec = issue.assigned_lecturer;
                          return lec ? (
                            <td key={c.id}>{lec.user.full_name}</td>
                          ) : assigningIssueId === issue.id ? (
                            loadingLecturers ? (
                              <span>Loading...</span>
                            ) : (
                              <div className="assign-list-inline">
                                {lecturers.map((l) => (
                                  <button
                                    key={l.id}
                                    className="action-button"
                                    onClick={() => handleAssign(issue.id, l.id)}
                                  >
                                    {l.name}
                                  </button>
                                ))}
                                {assignMessages[issue.id] && (
                                  <div className="assign-message">
                                    {assignMessages[issue.id]}
                                  </div>
                                )}
                              </div>
                            )
                          ) : (
                            <button
                              className="action-button"
                              onClick={() => handleAssignClick(issue.id)}
                            >
                              Assign
                            </button>
                          );
                        }
                        case "student":
                          return (
                            <td key={c.id}>
                              {issue.author.user.full_name}
                            </td>
                          );
                        case "actions":
                          return (
                            <td key={c.id}>
                              <button
                                className="action-button"
                                onClick={() => onViewIssue(issue)}
                              >
                                View
                              </button>
                            </td>
                          );
                        case "resolve":
                          return issue.status.toLowerCase() !== "resolved" ? (
                            <td key={c.id}>
                              <button
                                className="action-button"
                                onClick={() => handleResolve(issue.id)}
                                disabled={resolvingIssueId === issue.id}
                              >
                                {resolvingIssueId === issue.id
                                  ? "Resolving..."
                                  : "Resolve"}
                              </button>
                              {resolveMessages[issue.id] && (
                                <div className="assign-message">
                                  {resolveMessages[issue.id]}
                                </div>
                              )}
                            </td>
                          ) : (
                            <td key={c.id}>Resolved</td>
                          );
                        default:
                          return <td key={c.id}>—</td>;
                      }
                    })}
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
};

export default IssueTable;
