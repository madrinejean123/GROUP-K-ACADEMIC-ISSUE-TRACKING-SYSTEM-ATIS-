import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/create-issue.css";

const CreateIssueForm = ({ onSubmit, onCancel }) => {
  const [newIssue, setNewIssue] = useState({
    title: "",
    description: "",
    courseCode: "",
    category: "missing_marks",  // match serializer choices
    attachment: null,
  });
  const [userData, setUserData] = useState({
    fullName: "",
    studentNo: "",
    college: "",
    school: "",
    department: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_FILE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get(
          "https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/users/profile/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const { full_name, student_no, college, school, department } = response.data;
        setUserData({
          fullName: full_name,
          studentNo: student_no,
          college: college?.name || "N/A",
          school: school?.school_name || "N/A",
          department: department?.name || "N/A",
        });
      } catch (error) {
        console.error("Fetch profile error:", error);
        toast.error("Failed to fetch user profile.");
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validateForm();
    }
  }, [newIssue, touched]);

  const validateForm = () => {
    const newErrors = {};

    if (!newIssue.title.trim()) {
      newErrors.title = "Title is required";
    } else if (newIssue.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    } else if (newIssue.title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    if (!newIssue.description.trim()) {
      newErrors.description = "Description is required";
    } else if (newIssue.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!newIssue.courseCode.trim()) {
      newErrors.courseCode = "Course code is required";
    } else if (!/^[A-Z]{3,4}\d{4}$/.test(newIssue.courseCode.trim())) {
      newErrors.courseCode =
        "Invalid course code format (e.g., CSC1234 or MATH1234)";
    }

    if (!newIssue.category) {
      newErrors.category = "Please select a category";
    }

    if (newIssue.attachment) {
      if (!ALLOWED_FILE_TYPES.includes(newIssue.attachment.type)) {
        newErrors.attachment = "File type not supported";
      } else if (newIssue.attachment.size > MAX_FILE_SIZE) {
        newErrors.attachment = "File size must be less than 5MB";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewIssue((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error(
        "Please upload a valid file type (image, PDF, or Word document)."
      );
      e.target.value = null;
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 5MB.");
      e.target.value = null;
      return;
    }

    setNewIssue((prev) => ({ ...prev, attachment: file }));
    setTouched((prev) => ({ ...prev, attachment: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      title: true,
      description: true,
      courseCode: true,
      category: true,
      attachment: true,
    });

    if (!validateForm()) {
      setFormError("Please fix the errors in the form before submitting.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const token = localStorage.getItem("access_token");

      // If no token, simulate success (for preview)
      if (!token) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        toast.success(`Issue "${newIssue.title}" created successfully!`, {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
        onSubmit(newIssue);
        return;
      }

      const formData = new FormData();
      formData.append("title", newIssue.title);
      formData.append("description", newIssue.description);
      formData.append("course_code", newIssue.courseCode);
      formData.append("category", newIssue.category);
      if (newIssue.attachment) {
        formData.append("attachment", newIssue.attachment);
      }

      const response = await axios.post(
        "https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/issues/create/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Do NOT set Content-Type; let the browser/Axios add the correct multipart boundary
          },
        }
      );

      console.log("Issue created:", response.data);
      toast.success(`Issue "${newIssue.title}" created successfully!`, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      onCancel();
    } catch (error) {
      console.error("Error creating issue:", error);
      const data = error.response?.data;
      // Gather field errors or generic error
      const errorMessage =
        data?.error ||
        (data && typeof data === "object"
          ? Object.values(data).flat().join(" ")
          : null) ||
        "Failed to create issue. Please try again.";
      toast.error(errorMessage);
      setFormError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="modal-overlay">
        <div className="issue-modal">
          <div className="modal-header">
            <h2>Create New Issue</h2>
            <button className="close-modal-button" onClick={onCancel}>
              X
            </button>
          </div>

          <div className="user-info">
            <p>
              <strong>Name:</strong> {userData.fullName || "Loading..."}
            </p>
            <p>
              <strong>Student No:</strong> {userData.studentNo || "Loading..."}
            </p>
            <p>
              <strong>College:</strong> {userData.college || "Loading..."}
            </p>
            <p>
              <strong>School:</strong> {userData.school || "Loading..."}
            </p>
            <p>
              <strong>Department:</strong>{" "}
              {userData.department || "Loading..."}
            </p>
          </div>

          {formError && <div className="form-error">{formError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div
              className={`form-group ${
                errors.title && touched.title ? "error" : ""
              }`}
            >
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newIssue.title}
                onChange={handleInputChange}
                placeholder="Enter the issue title"
              />
              {errors.title && touched.title && (
                <div className="error-message">{errors.title}</div>
              )}
            </div>

            <div
              className={`form-group ${
                errors.courseCode && touched.courseCode ? "error" : ""
              }`}
            >
              <label htmlFor="courseCode">Course Code</label>
              <input
                type="text"
                id="courseCode"
                name="courseCode"
                value={newIssue.courseCode}
                onChange={handleInputChange}
                placeholder="E.g., CSC1200 or MATH1234"
              />
              {errors.courseCode && touched.courseCode && (
                <div className="error-message">{errors.courseCode}</div>
              )}
            </div>

            <div
              className={`form-group ${
                errors.category && touched.category ? "error" : ""
              }`}
            >
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={newIssue.category}
                onChange={handleInputChange}
              >
                <option value="missing_marks">Missing Marks</option>
                <option value="appeals">Appeals</option>
                <option value="correction">Corrections</option>
              </select>
              {errors.category && touched.category && (
                <div className="error-message">{errors.category}</div>
              )}
            </div>

            <div
              className={`form-group ${
                errors.description && touched.description ? "error" : ""
              }`}
            >
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={newIssue.description}
                onChange={handleInputChange}
                placeholder="Describe your issue..."
              />
              {errors.description && touched.description && (
                <div className="error-message">{errors.description}</div>
              )}
            </div>

            <div
              className={`form-group ${
                errors.attachment && touched.attachment ? "error" : ""
              }`}
            >
              <label htmlFor="attachment">
                Attach Supporting File (Optional)
              </label>
              <input
                type="file"
                id="attachment"
                name="attachment"
                onChange={handleFileChange}
              />
              <div className="file-info">
                Optional: JPG/PNG/PDF/DOC (Max 5MB)
              </div>
              {errors.attachment && touched.attachment && (
                <div className="error-message">{errors.attachment}</div>
              )}
              {newIssue.attachment && (
                <div className="file-preview">
                  Selected: {newIssue.attachment.name} (
                  {(newIssue.attachment.size / 1024 / 1024).toFixed(2)} MB)
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
    </>
  );
};

export default CreateIssueForm;
