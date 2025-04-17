// src/components/IssueList.jsx
import { useState, useEffect } from "react";
import axios from "axios";            // ← new
import { FaSearch, FaPlus } from "react-icons/fa";
import IssueTable from "./IssueTable";
import "../styles/issue-list.css";

const IssueList = ({
  title = "Issues",
  showCreateButton = true,
  onCreateIssue,
  onViewIssue,
  userRole,
}) => {
  // ─── FETCHED ISSUES STATE ──────────────────────────────
  const [issues, setIssues]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    axios
      .get("https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/issues/list/")
      .then((res) => {
        setIssues(res.data);
      })
      .catch((err) => {
        console.error("Error fetching issues:", err);
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ─── LOCAL FILTER STATE ────────────────────────────────
  const [searchTerm, setSearchTerm]     = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // ─── RENDER LOADING / ERROR ───────────────────────────
  if (loading) return <div>Loading issues…</div>;
  if (error)   return <div>Error loading issues: {error.message}</div>;

  // ─── FILTER & SORT ────────────────────────────────────
  const getFilteredAndSortedIssues = () => {
    let filtered = issues.filter(
      (issue) =>
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (issue.category &&
          issue.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (issue) => issue.status.toLowerCase() === statusFilter
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (issue) => issue.category === categoryFilter
      );
    }

    // sort by created_at descending
    return filtered.sort((a, b) => {
      return new Date(b.created_at) - new Date(a.created_at);
    });
  };

  const filteredIssues = getFilteredAndSortedIssues();

  // ─── JSX ───────────────────────────────────────────────
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
