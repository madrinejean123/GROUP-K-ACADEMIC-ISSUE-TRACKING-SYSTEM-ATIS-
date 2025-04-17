// Components/issues/IssueDetail.jsx
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
  const [showAssignList, setShowAssignList] = useState(false);

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
    if (userRole === "Registrar" && issue.status === "Open") {
      return [{ label: "Assign to Lecturer", action: "assign" }];
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
    if (act === "assign") {
      setShowAssignList((v) => !v);
    } else {
      onStatusChange(act);
    }
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
              <strong>Submitted:</strong> {issue.date}
            </div>
            <div>
              <strong>Category:</strong>{" "}
              <span
                className={`category-badge ${getCategoryClass(
                  issue.category
                )}`}
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
            <p className="issue-detail-description">
              {issue.description}
            </p>

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

          {/* inline assign toggle */}
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

              {showAssignList && (
                <div className="assign-list">
                  <p>Select a lecturer to assign:</p>
                  {lecturers.map((lec) => (
                    <button
                      key={lec.id}
                      className="action-button"
                      onClick={() => onAssign(lec.id)}
                    >
                      {lec.name}
                    </button>
                  ))}
                  {issue.assignMessage && (
                    <div className="assign-message">
                      {issue.assignMessage}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;
