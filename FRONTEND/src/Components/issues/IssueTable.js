import "../styles/issue-table.css";

const IssueTable = ({ issues, onViewIssue, userRole }) => {
  // Get status badge class
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
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

  // Add a function to get category badge class
  const getCategoryClass = (category) => {
    if (!category) return "";

    switch (category.toLowerCase()) {
      case "missing marks":
        return "category-missing-marks";
      case "appeals":
        return "category-appeals";
      case "correction":
        return "category-correction";
      default:
        return "";
    }
  };

  // Customize columns based on user role
  const getTableColumns = () => {
    const commonColumns = [
      { id: "id", label: "ID" },
      { id: "title", label: "Title" },
      { id: "description", label: "Description" },
      { id: "date", label: "Date" },
      { id: "category", label: "Category" },
      { id: "status", label: "Status" },
      { id: "actions", label: "Actions" },
    ];

    if (userRole === "Registrar") {
      return [
        ...commonColumns.slice(0, -1),
        { id: "assignee", label: "Assignee" },
        { id: "actions", label: "Actions" },
      ];
    }

    if (userRole === "Lecturer") {
      return [
        ...commonColumns.slice(0, -1),
        { id: "student", label: "Student" },
        { id: "actions", label: "Actions" },
      ];
    }

    return commonColumns;
  };

  const columns = getTableColumns();

  return (
    <div className="issues-table-container">
      <table className="issues-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.id}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {issues.length > 0 ? (
            issues.map((issue) => (
              <tr key={issue.id}>
                <td>#{issue.id}</td>
                <td>{issue.title}</td>
                <td className="description-cell">{issue.description}</td>
                <td>{issue.date}</td>
                <td>
                  <span
                    className={`category-badge ${getCategoryClass(
                      issue.category
                    )}`}
                  >
                    {issue.category || "Not specified"}
                  </span>
                </td>
                <td>
                  <span
                    className={`status-badge ${getStatusClass(issue.status)}`}
                  >
                    {issue.status}
                  </span>
                </td>
                {userRole === "Registrar" && (
                  <td>{issue.assignee || "Unassigned"}</td>
                )}
                {userRole === "Lecturer" && (
                  <td>{issue.student || "Unknown"}</td>
                )}
                <td>
                  <button
                    className="action-button"
                    onClick={() => onViewIssue(issue)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="no-issues">
                No issues found matching your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default IssueTable;
