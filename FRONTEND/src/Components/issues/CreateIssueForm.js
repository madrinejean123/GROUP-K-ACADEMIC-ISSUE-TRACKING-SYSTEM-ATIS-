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
    category: "missing_marks",
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
    "image/jpeg","image/png","image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("access_token");
        const { data } = await axios.get(
          "https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/users/profile/",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const { full_name, student_no, college, school, department } = data;
        setUserData({
          fullName: full_name,
          studentNo: student_no,
          college: college?.name || "N/A",
          school:  school?.school_name || "N/A",
          department: department?.name || "N/A",
        });
      } catch (e) {
        console.error("Profile fetch error:", e);
        toast.error("Failed to fetch user profile.");
      }
    })();
  }, []);

  useEffect(() => {
    if (Object.keys(touched).length) validateForm();
  }, [newIssue, touched]);

  const validateForm = () => {
    const errs = {};
    if (!newIssue.title.trim()) errs.title = "Title is required";
    else if (newIssue.title.length < 5) errs.title = "Min 5 characters";
    else if (newIssue.title.length > 100) errs.title = "Max 100 characters";

    if (!newIssue.description.trim()) errs.description = "Description is required";
    else if (newIssue.description.length < 10) errs.description = "Min 10 characters";

    if (!newIssue.courseCode.trim()) errs.courseCode = "Course code is required";
    else if (!/^[A-Z]{3,4}\d{4}$/.test(newIssue.courseCode))
      errs.courseCode = "Format e.g., CSC1234";

    if (!newIssue.category) errs.category = "Please select a category";

    if (newIssue.attachment) {
      if (!ALLOWED_FILE_TYPES.includes(newIssue.attachment.type))
        errs.attachment = "File type not supported";
      else if (newIssue.attachment.size > MAX_FILE_SIZE)
        errs.attachment = "Max size 5MB";
    }

    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewIssue((p) => ({ ...p, [name]: value }));
    setTouched((p) => ({ ...p, [name]: true }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error("Invalid file type.");
      e.target.value = null;
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large.");
      e.target.value = null;
      return;
    }
    setNewIssue((p) => ({ ...p, attachment: file }));
    setTouched((p) => ({ ...p, attachment: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      title: true, description: true,
      courseCode: true, category: true,
      attachment: true,
    });
    if (!validateForm()) {
      setFormError("Fix form errors before submitting.");
      return;
    }
    setIsSubmitting(true);
    setFormError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        // preview mode
        await new Promise((r) => setTimeout(r, 1000));
        toast.success(`Created "${newIssue.title}" (preview)`);
        onSubmit(newIssue);
        return;
      }
      const fd = new FormData();
      fd.append("title", newIssue.title);
      fd.append("description", newIssue.description);
      fd.append("course_code", newIssue.courseCode);
      fd.append("category", newIssue.category);
      if (newIssue.attachment) fd.append("attachment", newIssue.attachment);

      const { data } = await axios.post(
        "https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/issues/create/",
        fd,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Created:", data);
      toast.success(`Issue "${newIssue.title}" created!`);
      onCancel();
    } catch (err) {
      console.error("Submit error full:", err);
      console.error("Submit error.response.data:", err.response?.data);
      const d = err.response?.data;
      const msg =
        d?.error ||
        (d && typeof d === "object" ? Object.values(d).flat().join(" ") : null) ||
        "Failed to create issue.";
      toast.error(msg);
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="modal-overlay">
        <div className="issue-modal">
          <header className="modal-header">
            <h2>Create New Issue</h2>
            <button onClick={onCancel} className="close-modal-button">
              ×
            </button>
          </header>

          <div className="user-info">
            <p><strong>Name:</strong> {userData.fullName || "..."}</p>
            <p><strong>Student No:</strong> {userData.studentNo || "..."}</p>
            <p><strong>College:</strong> {userData.college || "..."}</p>
            <p><strong>School:</strong> {userData.school || "..."}</p>
            <p><strong>Department:</strong> {userData.department || "..."}</p>
          </div>

          {formError && <div className="form-error">{formError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            {/* Title */}
            <div className={`form-group ${errors.title && touched.title ? "error" : ""}`}>
              <label htmlFor="title">Title</label>
              <input
                id="title" name="title" type="text"
                value={newIssue.title}
                onChange={handleChange}
                placeholder="Issue title"
              />
              {errors.title && touched.title && (
                <small className="error-message">{errors.title}</small>
              )}
            </div>

            {/* Course Code */}
            <div className={`form-group ${errors.courseCode && touched.courseCode ? "error" : ""}`}>
              <label htmlFor="courseCode">Course Code</label>
              <input
                id="courseCode" name="courseCode" type="text"
                value={newIssue.courseCode}
                onChange={handleChange}
                placeholder="CSC1200"
              />
              {errors.courseCode && touched.courseCode && (
                <small className="error-message">{errors.courseCode}</small>
              )}
            </div>

            {/* Category */}
            <div className={`form-group ${errors.category && touched.category ? "error" : ""}`}>
              <label htmlFor="category">Category</label>
              <select
                id="category" name="category"
                value={newIssue.category}
                onChange={handleChange}
              >
                <option value="missing_marks">Missing Marks</option>
                <option value="appeals">Appeals</option>
                <option value="correction">Corrections</option>
              </select>
              {errors.category && touched.category && (
                <small className="error-message">{errors.category}</small>
              )}
            </div>

            {/* Description */}
            <div className={`form-group ${errors.description && touched.description ? "error" : ""}`}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description" name="description"
                value={newIssue.description}
                onChange={handleChange}
                placeholder="Describe your issue…"
              />
              {errors.description && touched.description && (
                <small className="error-message">{errors.description}</small>
              )}
            </div>

            {/* Attachment */}
            <div className={`form-group ${errors.attachment && touched.attachment ? "error" : ""}`}>
              <label htmlFor="attachment">Attachment (optional)</label>
              <input
                id="attachment"
                name="attachment"
                type="file"
                onChange={handleFile}
              />
              <small className="file-info">
                JPG/PNG/PDF/DOC up to 5MB
              </small>
              {errors.attachment && touched.attachment && (
                <small className="error-message">{errors.attachment}</small>
              )}
              {newIssue.attachment && (
                <div className="file-preview">
                  {newIssue.attachment.name} (
                  {(newIssue.attachment.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>

            <footer className="form-actions">
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
                {isSubmitting ? "Submitting…" : "Submit Issue"}
              </button>
            </footer>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateIssueForm;
