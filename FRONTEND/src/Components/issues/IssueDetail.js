// ─── Components/issues/IssueDetail.jsx ─────────────────────────────────────
"use client";
import { useState } from "react";
import { FaTimes, FaFile } from "react-icons/fa";
import "../styles/issue-detail.css";

const IssueDetail = ({
  issue,
  onClose,
  onStatusChange,
  onAddComment,
  onAssign,
  userRole,
  lecturers = [],
}) => {
  const [newComment, setNewComment] = useState("");
  const [selectedLecturerId, setSelectedLecturerId] = useState("");

  // Format status/category badges
  const getStatusClass = (s) => ({
    open: "status-open",
    "in progress": "status-progress",
    resolved: "status-resolved",
    closed: "status-closed",
  }[s.toLowerCase()] || "status-default");

  const getCategoryClass = (c) => ({
    "missing marks": "category-missing-marks",
    appeals: "category-appeals",
    correction: "category-correction",
  }[c?.toLowerCase()] || "");

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment);
    setNewComment("");
  };

  const availableActions = (() => {
    if (userRole === "Student") {
      if (issue.status === "Open")
        return [{ label: "Request Update", action: "In Progress" }];
      if (issue.status === "Resolved")
        return [
          { label: "Close Issue", action: "Closed" },
          { label: "Reopen Issue", action: "Open" },
        ];
    }
    if (userRole === "Registrar" && issue.status === "Open") {
      // We handle “Assign” inline, not via onStatusChange
      return [{ label: "Assign", action: "assign" }];
    }
    if (userRole === "Lecturer") {
      if (issue.status === "In Progress")
        return [{ label: "Mark as Resolved", action: "Resolved" }];
      if (issue.status === "Open")
        return [{ label: "Start Working", action: "In Progress" }];
    }
    return [];
  })();

  const handleActionClick = (action) => {
    if (action === "assign") return;
    onStatusChange(action);
  };

  const handleAssignClick = () => {
    if (!selectedLecturerId) return;
    onAssign(selectedLecturerId);
  };

  return (
    <div className="modal-overlay">
      <div className="issue-detail-modal">
        <div className="modal-header">
          <h2>Issue Details</h2>
          <button className="close-modal-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="issue-detail-content">
          <div className="issue-detail-header">
            <div className="issue-id-badge">#{issue.id}</div>
            <span className={`status-badge ${getStatusClass(issue.status)}`}>
              {issue.status}
            </span>
          </div>

          <h3 className="issue-detail-title">{issue.title}</h3>

          <div className="issue-detail-meta">
            <div>
              <strong>Submitted:</strong>{" "}
              {new Date(issue.date).toLocaleString()}
            </div>
            <div>
              <strong>Submitted by:</strong> {issue.author || "Unknown"}
            </div>
            <div>
              <strong>Category:</strong>{" "}
              <span
                className={`category-badge ${getCategoryClass(issue.category)}`}
              >
                {issue.category || "Not specified"}
              </span>
            </div>
            {userRole === "Registrar" && (
              <div>
                <strong>Assignee:</strong> {issue.assignee || "Unassigned"}
              </div>
            )}
            {userRole === "Lecturer" && (
              <div>
                <strong>Student:</strong> {issue.student || "Unknown"}
              </div>
            )}
          </div>

          <div className="issue-detail-section">
            <h4>Description</h4>
            <p>{issue.description}</p>

            {issue.attachments?.length > 0 && (
              <div className="issue-attachments">
                <h5>Attachments</h5>
                {issue.attachments.map((file, i) => (
                  <a
                    key={i}
                    href="#"
                    className="attachment-link"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Downloading file: ${file.name}`);
                    }}
                  >
                    <FaFile /> {file.name}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="issue-detail-section">
            <h4>Comments</h4>
            <div className="comments-list">
              {issue.comments?.length ? (
                issue.comments.map((c, i) => (
                  <div className="comment-item" key={i}>
                    <div className="comment-header">
                      <img
                        src="/placeholder.svg?height=40&width=40"
                        alt={c.author}
                        className="comment-avatar"
                      />
                      <div className="comment-meta">
                        <div className="comment-author">{c.author}</div>
                        <div className="comment-date">{c.date}</div>
                      </div>
                    </div>
                    <div className="comment-content">{c.content}</div>
                  </div>
                ))
              ) : (
                <div className="no-comments">No comments yet.</div>
              )}
            </div>
            <div className="add-comment">
              <textarea
                rows="3"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="comment-input"
              />
              <button className="submit-button" onClick={handleAddComment}>
                Post Comment
              </button>
            </div>
          </div>

          {/* Inline Assign (Registrar only) */}
          {availableActions.find((a) => a.action === "assign") && (
            <div className="issue-detail-section">
              <h4>Assign to Lecturer</h4>
              <select
                value={selectedLecturerId}
                onChange={(e) => setSelectedLecturerId(e.target.value)}
              >
                <option value="">— Select lecturer —</option>
                {lecturers.map((lec) => (
                  <option key={lec.id} value={lec.id}>
                    {lec.name}
                  </option>
                ))}
              </select>
              <button
                className="action-button"
                onClick={handleAssignClick}
                disabled={!selectedLecturerId}
              >
                Assign
              </button>
            </div>
          )}

          {/* Other status actions */}
          {availableActions.filter((a) => a.action !== "assign").length > 0 && (
            <div className="issue-detail-section">
              <h4>Actions</h4>
              <div className="issue-actions">
                {availableActions
                  .filter((a) => a.action !== "assign")
                  .map((a, i) => (
                    <button
                      key={i}
                      className="action-button status-update-button"
                      onClick={() => handleActionClick(a.action)}
                    >
                      {a.label}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;
