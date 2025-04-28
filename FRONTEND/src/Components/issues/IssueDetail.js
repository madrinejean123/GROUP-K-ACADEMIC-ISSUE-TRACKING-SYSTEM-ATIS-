import React, { useState } from "react";
import { FaTimes, FaFile } from "react-icons/fa";
import "../styles/issue-detail.css";

const IssueDetail = ({
  issue,
  onClose,
  onStatusChange,
  onAddComment,
  userRole,
}) => {
  const [newComment, setNewComment]  = useState("");

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

  const getCategoryClass = (c) => {
    if (!c) return "";
    switch (c.toLowerCase()) {
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

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment);
    setNewComment("");
  };

  const actions = (() => {
    if (userRole === "Student") {
      if (issue.status === "Open")
        return [{ label: "Request Update", action: "In Progress" }];
      if (issue.status === "Resolved")
        return [
          { label: "Close Issue", action: "Closed" },
          { label: "Reopen Issue", action: "Open" },
        ];
    }
    if (userRole === "Lecturer") {
      if (issue.status === "In Progress")
        return [{ label: "Mark as Resolved", action: "Resolved" }];
      if (issue.status === "Open")
        return [{ label: "Start Working", action: "In Progress" }];
    }
    return [];
  })();

  const onActionClick = (act) => {
    onStatusChange(act);
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
              <strong>Author:</strong>{" "}
              {issue.author?.user?.full_name || issue.author || "Unknown"}
            </div>
            <div>
              <strong>Submitted:</strong>{" "}
              {new Date(issue.created_at).toLocaleString()}
            </div>
            <div>
              <strong>Category:</strong>{" "}
              <span className={`category-badge ${getCategoryClass(issue.category)}`}>
                {issue.category || "Not specified"}
              </span>
            </div>
            <div>
              <strong>Assigned Lecturer:</strong>{" "}
              {issue.assigned_lecturer?.user?.full_name || "Unassigned"}
            </div>
            {userRole === "Lecturer" && (
              <div>
                <strong>Student:</strong>{" "}
                {issue.student || "Unknown"}
              </div>
            )}
          </div>

          <div className="issue-detail-section">
            <h4>Description</h4>
            <p className="issue-detail-description">{issue.description}</p>

            {issue.attachments?.length > 0 && (
              <div className="issue-attachments">
                <h5>Attachments</h5>
                {issue.attachments.map((file, idx) => (
                  <a
                    key={idx}
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
                className="comment-input"
                rows="3"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button className="submit-button" onClick={handleAddComment}>
                Post Comment
              </button>
            </div>
          </div>

          {actions.length > 0 && (
            <div className="issue-detail-section">
              <h4>Actions</h4>
              <div className="issue-actions">
                {actions.map((a, i) => (
                  <button
                    key={i}
                    className="action-button status-update-button"
                    onClick={() => onActionClick(a.action)}
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
