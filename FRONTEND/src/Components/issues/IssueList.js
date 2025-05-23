import { useState } from "react";
import { FaSearch, FaPlus } from "react-icons/fa";
import IssueTable from "./IssueTable";
import "../styles/issue-list.css";

const IssueList = ({
  issues,
  title = "Issues",
  showCreateButton = true,
  onCreateIssue,
  onViewIssue,
  onAssign, // <-- accept onAssign prop
  userRole,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = issues
    .filter((i) =>
      [i.title, i.description, i.status]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .filter(
      (i) => statusFilter === "all" || i.status.toLowerCase() === statusFilter
    )
    .filter((i) => categoryFilter === "all" || i.category === categoryFilter)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div className="issues-section">
      <div className="issues-header">
        <h2>{title}</h2>
        {showCreateButton && (
          <button className="create-button" onClick={onCreateIssue}>
            <FaPlus /> Create Issue
          </button>
        )}
      </div>

      <div className="search-filter">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          {Array.from(new Set(issues.map((i) => i.status))).map((s) => (
            <option key={s} value={s.toLowerCase()}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          {Array.from(new Set(issues.map((i) => i.category)))
            .filter(Boolean)
            .map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
        </select>
      </div>

      <IssueTable
        issues={filtered}
        onViewIssue={onViewIssue}
        onAssign={onAssign} // <-- pass onAssign down
        userRole={userRole}
      />
    </div>
  );
};

export default IssueList;
