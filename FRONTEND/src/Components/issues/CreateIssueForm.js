import { useState, useEffect } from "react";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";
import "../styles/create-issue.css";
import axios from "axios";

const CreateIssueForm = ({ onSubmit, onCancel }) => {
  // Form state
  const [newIssue, setNewIssue] = useState({
    title: "",
    description: "",
    courseCode: "",
    category: "Missing Marks",
    status: "Open",
    attachments: [],
  });
  const [userData, setUserData] = useState({
    name: "",
    studentNo: "",
    college: "",
  });
  // Removed duplicate declaration of formError and setFormError

  // Fetch user data from the backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("access_token"); // Get the token for authentication
        const response = await axios.get("http://127.0.0.1:8000/users/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("User data fetched:", response.data); // Debug: Log the response

        // If response.data is an array, get the first element, otherwise use the object directly
        const user = Array.isArray(response.data)
          ? response.data[0]
          : response.data;
        const { username, student_no, college } = user;
        console.log("College Data:", college); // Debug: Log the college object

        setUserData({
          name: username,
          studentNo: student_no,
          college: college?.name || "N/A", // Use college.name if available
        });
      } catch (error) {
        console.error("Error fetching user data:", error); // Debug: Log the error
        setFormError("Failed to load user data. Please try again.");
      }
    };

    fetchUserData();
  }, []);

  // Optional: Log userData to verify state updates
  useEffect(() => {
    console.log("Updated userData:", userData);
  }, [userData]);


  // Validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // File size limit in bytes (5MB)
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  // Allowed file types
  const ALLOWED_FILE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  // Validate form on input change
  useEffect(() => {
    validateForm();
  }, [newIssue]);

  // Handle input changes
  const handleNewIssueChange = (e) => {
    const { name, value } = e.target;

    setNewIssue((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Mark field as touched
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  // Handle file attachment
  const handleFileAttachment = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const fileErrors = [];

    // Validate each file
    files.forEach((file) => {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        fileErrors.push(`${file.name} exceeds the 5MB size limit`);
        return;
      }

      // Check file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        fileErrors.push(`${file.name} has an unsupported file type`);
        return;
      }

      validFiles.push(file);
    });

    // Update attachments with valid files
    setNewIssue((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles],
    }));

    // Set file errors if any
    if (fileErrors.length > 0) {
      setErrors((prev) => ({
        ...prev,
        attachments: fileErrors,
      }));
    }

    // Mark attachments as touched
    setTouched((prev) => ({
      ...prev,
      attachments: true,
    }));
  };

  // Remove attachment
  const removeAttachment = (index) => {
    setNewIssue((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Validate title
    if (!newIssue.title.trim()) {
      newErrors.title = "Title is required";
    } else if (newIssue.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    } else if (newIssue.title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    // Validate course code
    if (!newIssue.courseCode.trim()) {
      newErrors.courseCode = "Course code is required";
    } else if (!/^[A-Z]{2,4}\d{3,4}$/.test(newIssue.courseCode.toUpperCase())) {
      newErrors.courseCode = "Invalid course code format (e.g. CS101, MATH202)";
    }

    // Validate description
    if (!newIssue.description.trim()) {
      newErrors.description = "Description is required";
    } else if (newIssue.description.length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    } else if (newIssue.description.length > 2000) {
      newErrors.description = "Description must be less than 2000 characters";
    }

    // Update errors state
    setErrors(newErrors);

    // Return whether form is valid
    return Object.keys(newErrors).length === 0;
  };

  // Check if field has error and has been touched
  const hasError = (field) => {
    return errors[field] && touched[field];
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const touchedFields = {};
    Object.keys(newIssue).forEach((key) => {
      touchedFields[key] = true;
    });
    setTouched(touchedFields);

    // Validate form
    const isValid = validateForm();

    if (!isValid) {
      // Scroll to first error
      const firstErrorField = document.querySelector(
        ".form-group.error input, .form-group.error textarea, .form-group.error select"
      );
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      // Format the issue data for submission
      const formattedIssue = {
        ...newIssue,
        courseCode: newIssue.courseCode.toUpperCase(), // Standardize course code format
      };

      // Call the onSubmit function which will handle the API call
      await onSubmit(formattedIssue);

      // Form submission was successful
      // Reset form (not needed if modal is closed after submission)
      // setNewIssue({
      //   title: "",
      //   description: "",
      //   courseCode: "",
      //   category: "Missing Marks",
      //   status: "Open",
      //   attachments: [],
      // })
      // setTouched({})
    } catch (error) {
      console.error("Form submission error:", error);
      // Set form error to display to the user
      setFormError(
        error.message || "Failed to submit issue. Please try again."
      );

      // If there's a validation error from the server
      if (error.validationErrors) {
        setErrors((prev) => ({
          ...prev,
          ...error.validationErrors,
        }));
      }
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

        {formError && (
          <div className="form-error">
            <FaExclamationTriangle className="error-icon" />
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className={`form-group ${hasError("title") ? "error" : ""}`}>
            <label htmlFor="title">
              Issue Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={newIssue.title}
              onChange={handleNewIssueChange}
              placeholder="Enter a descriptive title"
              required
              aria-invalid={hasError("title")}
              aria-describedby={hasError("title") ? "title-error" : undefined}
            />
            {hasError("title") && (
              <div className="error-message" id="title-error">
                {errors.title}
              </div>
            )}
          </div>

          <div
            className={`form-group ${hasError("courseCode") ? "error" : ""}`}
          >
            <label htmlFor="courseCode">
              Course Code <span className="required">*</span>
            </label>
            <input
              type="text"
              id="courseCode"
              name="courseCode"
              value={newIssue.courseCode}
              onChange={handleNewIssueChange}
              placeholder="e.g. CS101, MATH202"
              required
              aria-invalid={hasError("courseCode")}
              aria-describedby={
                hasError("courseCode") ? "courseCode-error" : undefined
              }
            />
            {hasError("courseCode") && (
              <div className="error-message" id="courseCode-error">
                {errors.courseCode}
              </div>
            )}
            <div className="field-hint">
              Format: Department code (2-4 letters) followed by course number
              (3-4 digits)
            </div>
          </div>

          <div
            className={`form-group ${hasError("description") ? "error" : ""}`}
          >
            <label htmlFor="description">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={newIssue.description}
              onChange={handleNewIssueChange}
              placeholder="Describe your issue in detail"
              rows="4"
              required
              aria-invalid={hasError("description")}
              aria-describedby={
                hasError("description") ? "description-error" : undefined
              }
            />
            {hasError("description") && (
              <div className="error-message" id="description-error">
                {errors.description}
              </div>
            )}
            <div className="character-count">
              {newIssue.description.length}/2000 characters
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="category">
              Category <span className="required">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={newIssue.category}
              onChange={handleNewIssueChange}
              required
            >
              <option value="Missing Marks">Missing Marks</option>
              <option value="Appeals">Appeals</option>
              <option value="Correction">Correction</option>
            </select>
          </div>

          <div
            className={`form-group ${hasError("attachments") ? "error" : ""}`}
          >
            <label htmlFor="attachments">Supporting Documents</label>
            <input
              type="file"
              id="attachments"
              name="attachments"
              onChange={handleFileAttachment}
              multiple
              className="file-input"
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
            />
            <div className="field-hint">
              Accepted file types: JPG, PNG, GIF, PDF, DOC, DOCX. Maximum size:
              5MB per file.
            </div>
            {hasError("attachments") && Array.isArray(errors.attachments) && (
              <div className="error-message">
                {errors.attachments.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}

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
                        aria-label={`Remove ${file.name}`}
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
