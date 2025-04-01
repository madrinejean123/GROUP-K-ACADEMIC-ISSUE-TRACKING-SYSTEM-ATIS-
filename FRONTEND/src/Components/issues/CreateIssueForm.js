import { useState, useEffect } from "react";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";
import "../styles/create-issue.css";
import axios from "axios";
import Select from "react-select";

// Hardcoded academic years in the desired format
const academicYears = ["2024/2025", "2023/2024", "2022/2023", "2021/2022"];

const CreateIssueForm = ({ onSubmit, onCancel }) => {
  // Form state including new fields for year and lecturer
  const [newIssue, setNewIssue] = useState({
    title: "",
    description: "",
    courseCode: "",
    category: "Missing Marks",
    status: "Open",
    attachments: [],
    yearOfSitting: "",
    lecturer: ""
  });
  const [userData, setUserData] = useState({
    name: "",
    studentNo: "",
    college: "",
  });
  const [formError, setFormError] = useState(null);

  // Validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lecturers state starts as an empty array
  const [lecturers, setLecturers] = useState([]);

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

  // Fetch user data from the backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("access_token"); // Get the token for authentication
        const response = await axios.get("http://127.0.0.1:8000/users/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("User data fetched:", response.data);

        const { username, student_no, college } = response.data;

        setUserData({
          name: username,
          studentNo: student_no,
          college: college?.name || "N/A", // Use college.name if available
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        setFormError("Failed to load user data. Please try again.");
      }
    };

    fetchUserData();
  }, []);

  // Fetch lecturers from the backend
  useEffect(() => {
    const fetchLecturers = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get("http://127.0.0.1:8000/users/lecturers/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Assuming response.data returns an array of lecturer objects,
        // each with a nested "user" object containing "username"
        setLecturers(response.data);
      } catch (error) {
        console.error("Error fetching lecturers:", error);
        // Optionally set a fallback or display an error message here
      }
    };

    fetchLecturers();
  }, []);

  // Optional: Log userData to verify state updates
  useEffect(() => {
    console.log("Updated userData:", userData);
  }, [userData]);

  // Validate form on input change
  useEffect(() => {
    validateForm();
  }, [newIssue]);

  // Handle input changes for text and select fields
  const handleNewIssueChange = (e) => {
    const { name, value } = e.target;
    setNewIssue((prev) => ({
      ...prev,
      [name]: value,
    }));
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

    files.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        fileErrors.push(`${file.name} exceeds the 5MB size limit`);
        return;
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        fileErrors.push(`${file.name} has an unsupported file type`);
        return;
      }
      validFiles.push(file);
    });

    setNewIssue((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles],
    }));

    if (fileErrors.length > 0) {
      setErrors((prev) => ({
        ...prev,
        attachments: fileErrors,
      }));
    }
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

  // Validate form inputs including new fields
  const validateForm = () => {
    const newErrors = {};

    if (!newIssue.title.trim()) {
      newErrors.title = "Title is required";
    } else if (newIssue.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    } else if (newIssue.title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    if (!newIssue.courseCode.trim()) {
      newErrors.courseCode = "Course code is required";
    } else if (!/^[A-Z]{2,4}\d{3,4}$/.test(newIssue.courseCode.toUpperCase())) {
      newErrors.courseCode = "Invalid course code format (e.g. CS101, MATH202)";
    }

    if (!newIssue.description.trim()) {
      newErrors.description = "Description is required";
    } else if (newIssue.description.length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    } else if (newIssue.description.length > 2000) {
      newErrors.description = "Description must be less than 2000 characters";
    }

    if (!newIssue.yearOfSitting) {
      newErrors.yearOfSitting = "Year of sitting is required";
    }

    if (!newIssue.lecturer) {
      newErrors.lecturer = "Please select a lecturer";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper to check for errors
  const hasError = (field) => {
    return errors[field] && touched[field];
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const touchedFields = {};
    Object.keys(newIssue).forEach((key) => {
      touchedFields[key] = true;
    });
    setTouched(touchedFields);

    const isValid = validateForm();
    if (!isValid) {
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
      const formattedIssue = {
        ...newIssue,
        courseCode: newIssue.courseCode.toUpperCase(),
      };
      await onSubmit(formattedIssue);
    } catch (error) {
      console.error("Form submission error:", error);
      setFormError(error.message || "Failed to submit issue. Please try again.");
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

        <div className="user-info">
          <p><strong>Name:</strong> {userData.name || "Loading..."}</p>
          <p><strong>Student No:</strong> {userData.studentNo || "Loading..."}</p>
          <p><strong>College:</strong> {userData.college || "Loading..."}</p>
        </div>

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

          <div className={`form-group ${hasError("courseCode") ? "error" : ""}`}>
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
              aria-describedby={hasError("courseCode") ? "courseCode-error" : undefined}
            />
            {hasError("courseCode") && (
              <div className="error-message" id="courseCode-error">
                {errors.courseCode}
              </div>
            )}
            <div className="field-hint">
              Format: Department code (2-4 letters) followed by course number (3-4 digits)
            </div>
          </div>

          <div className={`form-group ${hasError("description") ? "error" : ""}`}>
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
              aria-describedby={hasError("description") ? "description-error" : undefined}
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

          {/* Year of Sitting Field with Academic Year Format */}
          <div className={`form-group ${hasError("yearOfSitting") ? "error" : ""}`}>
            <label htmlFor="yearOfSitting">
              Year of Sitting <span className="required">*</span>
            </label>
            <select
              id="yearOfSitting"
              name="yearOfSitting"
              value={newIssue.yearOfSitting}
              onChange={handleNewIssueChange}
              required
            >
              <option value="">-- Select Year --</option>
              {academicYears.map((yearOption) => (
                <option key={yearOption} value={yearOption}>
                  {yearOption}
                </option>
              ))}
            </select>
            {hasError("yearOfSitting") && (
              <div className="error-message">
                {errors.yearOfSitting}
              </div>
            )}
          </div>

          {/* Lecturer Search Field */}
          <div className={`form-group ${hasError("lecturer") ? "error" : ""}`}>
            <label htmlFor="lecturer">
              Lecturer <span className="required">*</span>
            </label>
            <Select
              id="lecturer"
              name="lecturer"
              options={lecturers.map((lecturer) => ({
                value: lecturer.id,
                label: lecturer.user?.username || "Unknown Lecturer",
              }))}
              onChange={(selectedOption) =>
                setNewIssue((prev) => ({
                  ...prev,
                  lecturer: selectedOption ? selectedOption.value : "",
                }))
              }
              placeholder="Search for a lecturer..."
              isClearable
            />
            {hasError("lecturer") && (
              <div className="error-message">
                {errors.lecturer}
              </div>
            )}
          </div>

          <div className={`form-group ${hasError("attachments") ? "error" : ""}`}>
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
              Accepted file types: JPG, PNG, GIF, PDF, DOC, DOCX. Maximum size: 5MB per file.
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
