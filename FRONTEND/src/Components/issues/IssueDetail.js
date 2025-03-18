import { useState } from "react";
import { FaTimes, FaFile } from "react-icons/fa";
import "../styles/issue-detail.css";

const IssueDetail = ({
  issue,
  onClose,
  onStatusChange,
  onAddComment,
  userRole,
}) => {
  const [newComment, setNewComment] = useState("");

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

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment);
    setNewComment("");
  };

  // Get available actions based on user role and issue status
  const getAvailableActions = () => {
    if (userRole === "Student") {
      if (issue.status === "Open") {
        return [{ label: "Request Update", action: "In Progress" }];
      } else if (issue.status === "Resolved") {
        return [
          { label: "Close Issue", action: "Closed" },
          { label: "Reopen Issue", action: "Open" },
        ];
      }
    } else if (userRole === "Registrar") {
      if (issue.status === "Open") {
        return [{ label: "Assign to Lecturer", action: "assign" }];
      }
    } else if (userRole === "Lecturer") {
      if (issue.status === "In Progress") {
        return [{ label: "Mark as Resolved", action: "Resolved" }];
      } else if (issue.status === "Open") {
        return [{ label: "Start Working", action: "In Progress" }];
      }
    }

    return [];
  };

  const actions = getAvailableActions();

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
            <div className="issue-detail-date">
              <strong>Submitted:</strong> {issue.date}
            </div>
            <div className="issue-detail-category">
              <strong>Category:</strong>{" "}
              <span
                className={`category-badge ${getCategoryClass(issue.category)}`}
              >
                {issue.category || "Not specified"}
              </span>
            </div>
            {userRole === "Registrar" && (
              <div className="issue-detail-assignee">
                <strong>Assignee:</strong> {issue.assignee || "Unassigned"}
              </div>
            )}
            {userRole === "Lecturer" && (
              <div className="issue-detail-student">
                <strong>Student:</strong> {issue.student || "Unknown"}
              </div>
            )}
          </div>

          <div className="issue-detail-section">
            <h4>Description</h4>
            <p className="issue-detail-description">{issue.description}</p>

            {issue.attachments && issue.attachments.length > 0 && (
              <div className="issue-attachments">
                <h5>Attachments</h5>
                <div>
                  {issue.attachments.map((file, index) => (
                    <a
                      key={index}
                      href="#"
                      className="attachment-link"
                      onClick={(e) => {
                        e.preventDefault();
                        // In a real app, this would download or open the file
                        alert(`Downloading file: ${file.name}`);
                      }}
                    >
                      <FaFile /> {file.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="issue-detail-section">
            <h4>Comments</h4>
            <div className="comments-list">
              {issue.comments && issue.comments.length > 0 ? (
                issue.comments.map((comment, index) => (
                  <div className="comment-item" key={index}>
                    <div className="comment-header">
                      <img
                        src="/placeholder.svg?height=40&width=40"
                        alt={comment.author}
                        className="comment-avatar"
                      />
                      <div className="comment-meta">
                        <div className="comment-author">{comment.author}</div>
                        <div className="comment-date">{comment.date}</div>
                      </div>
                    </div>
                    <div className="comment-content">{comment.content}</div>
                  </div>
                ))
              ) : (
                <div className="no-comments">No comments yet.</div>
              )}
            </div>

            <div className="add-comment">
              <textarea
                placeholder="Add a comment..."
                className="comment-input"
                rows="3"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              ></textarea>
              <button className="submit-button" onClick={handleAddComment}>
                Post Comment
              </button>
            </div>
          </div>

          {/* Status update section */}
          {actions.length > 0 && (
            <div className="issue-detail-section">
              <h4>Actions</h4>
              <div className="issue-actions">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    className="action-button status-update-button"
                    onClick={() => onStatusChange(action.action)}
                  >
                    {action.label}
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
