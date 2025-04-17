// src/components/IssueTable.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/issue-table.css";

const IssueTable = ({ onViewIssue, userRole }) => {
  const [issues, setIssues]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    axios
      .get("https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/issues/list/")
      .then((res) => setIssues(res.data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading issues…</div>;
  if (error)   return <div>Error loading issues: {error.message}</div>;

  // derive unique statuses
  const statuses = Array.from(new Set(issues.map((i) => i.status)));

  // define table columns based on userRole
  const getTableColumns = () => {
    const commonColumns = [
      { id: "id", label: "ID" },
      { id: "title", label: "Title" },
      { id: "description", label: "Description" },
      { id: "date", label: "Submitted At" },
      { id: "status", label: "Status" },
      { id: "actions", label: "Actions" },
    ];

    if (userRole === "Registrar") {
      return [
        ...commonColumns.slice(0, -1),
        { id: "assignee", label: "Assignee" },
        commonColumns[commonColumns.length - 1],
      ];
    }

    if (userRole === "Lecturer") {
      return [
        ...commonColumns.slice(0, -1),
        { id: "student", label: "Student" },
        commonColumns[commonColumns.length - 1],
      ];
    }

    return commonColumns;
  };

  const columns = getTableColumns();

  // status badge classes
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "open": return "status-open";
      case "in progress": return "status-progress";
      case "resolved": return "status-resolved";
      case "closed": return "status-closed";
      default: return "status-default";
    }
  };

  return (
    <div className="issues-table-container">
      {statuses.map((status) => (
        <section key={status} className="status-group">
          <h3 className="group-title">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </h3>
          <table className="issues-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.id}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {issues
                .filter((i) => i.status === status)
                .map((issue) => (
                  <tr key={issue.id}>
                    {columns.map((col) => {
                      switch (col.id) {
                        case "id":
                          return <td key={col.id}>#{issue.id}</td>;
                        case "title":
                          return <td key={col.id}>{issue.title}</td>;
                        case "description":
                          return <td key={col.id} className="description-cell">
                            {issue.description}
                          </td>;
                        case "date":
                          return <td key={col.id}>
                            {new Date(issue.created_at).toLocaleString(undefined, {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>;
                        case "status":
                          return <td key={col.id}>
                            <span className={`status-badge ${getStatusClass(issue.status)}`}> 
                              {issue.status}
                            </span>
                          </td>;
                        case "assignee":
                          return <td key={col.id}>
                            {issue.assigned_lecturer?.user?.full_name || issue.register?.user?.full_name || "Unassigned"}
                          </td>;
                        case "student":
                          return <td key={col.id}>
                            {issue.author?.user?.full_name || "Unknown"}
                          </td>;
                        case "actions":
                          return <td key={col.id}>
                            <button
                              className="action-button"
                              onClick={() => onViewIssue(issue)}
                            >
                              View
                            </button>
                          </td>;
                        default:
                          return <td key={col.id}>—</td>;
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
