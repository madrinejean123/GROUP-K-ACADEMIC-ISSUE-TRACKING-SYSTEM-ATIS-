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
  userRole,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Filter and sort issues
  const getFilteredAndSortedIssues = () => {
    // First filter by search term
    let filtered = issues.filter(
      (issue) =>
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (issue.category &&
          issue.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Then filter by status if not "all"
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (issue) => issue.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Then filter by category if not "all"
    if (categoryFilter !== "all") {
      filtered = filtered.filter((issue) => issue.category === categoryFilter);
    }

    // Sort by newest first (default)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });
  };

  const filteredIssues = getFilteredAndSortedIssues();

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
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-options">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="Missing Marks">Missing Marks</option>
            <option value="Appeals">Appeals</option>
            <option value="Correction">Correction</option>
          </select>
        </div>
      </div>

      <IssueTable
        issues={filteredIssues}
        onViewIssue={onViewIssue}
        userRole={userRole}
      />
    </div>
  );
};

export default IssueList;
