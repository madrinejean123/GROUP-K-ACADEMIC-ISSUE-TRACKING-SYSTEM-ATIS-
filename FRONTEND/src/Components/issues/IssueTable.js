import React from "react";
import "../styles/issue-table.css";

const IssueTable = ({ issues, onViewIssue, userRole }) => {
  const statuses = Array.from(new Set(issues.map((i) => i.status)));

  // build columns dynamically
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
    switch (s.toLowerCase()) {
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
                        case "assignee":
                          return (
                            <td key={c.id}>
                              {issue.assignee || "Unassigned"}
                            </td>
                          );
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
