import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import "../styles/create-issue.css";

const CreateIssueForm = ({ onSubmit, onCancel }) => {
  const [newIssue, setNewIssue] = useState({
    title: "",
    courseCode: "",
    description: "",
    category: "Missing Marks",
    status: "Open",
    attachments: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleNewIssueChange = (e) => {
    const { name, value } = e.target;
    setNewIssue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileAttachment = (e) => {
    const files = Array.from(e.target.files);
    setNewIssue((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  const removeAttachment = (index) => {
    setNewIssue((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      //  onSubmit function to handle the API call
      await onSubmit(newIssue);
      // Form submission was successful-handle ui
    } catch (error) {
      // Set form error to display to the user
      setFormError(
        error.message || "Failed to submit issue. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="issue-modal">
        <div className="modal-header">
          <h2>Create New Issue</h2>
          <button className="close-modal-button" onClick={onCancel}>
            <FaTimes />
          </button>
        </div>
        {formError && <div className="form-error">{formError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Issue Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={newIssue.title}
              onChange={handleNewIssueChange}
              placeholder="Enter a descriptive title"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="courseCode">Course Code</label>
            <input
              type="text"
              id="courseCode"
              name="courseCode"
              value={newIssue.courseCode}
              onChange={handleNewIssueChange}
              placeholder="e.g. CS101, MATH202"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={newIssue.description}
              onChange={handleNewIssueChange}
              placeholder="Describe your issue in detail"
              rows="4"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={newIssue.category}
              onChange={handleNewIssueChange}
            >
              <option value="Missing Marks">Missing Marks</option>
              <option value="Appeals">Appeals</option>
              <option value="Correction">Correction</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="attachments">Supporting Documents</label>
            <input
              type="file"
              id="attachments"
              name="attachments"
              onChange={handleFileAttachment}
              multiple
              className="file-input"
            />
            {newIssue.attachments.length > 0 && (
              <div className="attachments-list">
                <p>Attached files:</p>
                <ul>
                  {newIssue.attachments.map((file, index) => (
                    <li key={index} className="attachment-item">
                      <span>{file.name}</span>
                      <button
                        type="button"
                        className="remove-attachment-button"
                        onClick={() => removeAttachment(index)}
                      >
                        <FaTimes />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Issue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateIssueForm;
