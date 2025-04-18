// Components/issues/IssueTable.jsx
import React, { useState } from "react";
import axios from "axios";
import "../styles/issue-table.css";

const IssueTable = ({ issues, onViewIssue, userRole, onAssign }) => {
  const [assigningIssueId, setAssigningIssueId] = useState(null);
  const [assignMessages, setAssignMessages] = useState({});
  const [lecturers, setLecturers] = useState([]);
  const [loadingLecturers, setLoadingLecturers] = useState(false);

  const statuses = Array.from(new Set(issues.map((i) => i.status)));

  const columns = [
    { id: "id", label: "ID" },
    { id: "title", label: "Title" },
    { id: "description", label: "Description" },
    { id: "date", label: "Submitted At" },
    { id: "status", label: "Status" },
    ...(userRole === "Registrar"
      ? [{ id: "assignee", label: "Assignee" }]
      : userRole === "Lecturer"
      ? [{ id: "student", label: "Student" }]
      : []),
    { id: "actions", label: "Actions" },
  ];

  const getStatusClass = (s) => {
    switch (s?.toLowerCase()) {
      case "open":
        return "status-open";
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
      const formatted = data.map((l) => ({
        id: l.id,
        name: l.user.full_name,
      }));
      setLecturers(formatted);
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
      const lecturerName = selected?.name ?? "Assigned";

      // Propagate up so parent can update issue.assignee in its state
      onAssign(issueId, lecturerId, lecturerName);

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

  return (
    <div className="issues-table-container">
      {statuses.map((status) => (
        <section key={status} className="status-group">
          <h3>{status}</h3>
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

                        case "assignee": {
                          // If already assigned, just show the lecturer's name
                          if (issue.assignee) {
                            return <td key={c.id}>{issue.assignee}</td>;
                          }
                          // Otherwise, show Assign button / dropdown
                          return (
                            <td key={c.id}>
                              {assigningIssueId === issue.id ? (
                                loadingLecturers ? (
                                  <span>Loading...</span>
                                ) : (
                                  <div className="assign-list-inline">
                                    {lecturers.map((lec) => (
                                      <button
                                        key={lec.id}
                                        className="action-button"
                                        onClick={() =>
                                          handleAssign(issue.id, lec.id)
                                        }
                                      >
                                        {lec.name}
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
                              )}
                            </td>
                          );
                        }

                        case "student":
                          return (
                            <td key={c.id}>
                              {issue.author?.user?.full_name || "Unknown"}
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
