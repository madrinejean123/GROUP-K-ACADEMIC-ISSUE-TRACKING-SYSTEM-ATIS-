import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/create-issue.css';

const CreateIssueForm = ({ onCancel }) => {
  const [newIssue, setNewIssue] = useState({
    title: "",
    description: "",
    attachment: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    studentNo: "",
    college: "",
  });

  // Fetch user data from the backend profile
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get("http://aits-group-k-backend-7ede8a18ee73.herokuapp.com/users/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { username, student_no, college } = response.data;
        setUserData({
          name: username,
          studentNo: student_no,
          college: college?.name || "N/A",
        });
      } catch (error) {
        toast.error("Failed to fetch user profile.");
      }
    };

    fetchUserData();
  }, []);

  // Handle input changes for text fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewIssue((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file attachment change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    // Optionally validate file type here (image or PDF)
    if (file && !file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast.error("Please upload a valid image or PDF file.");
      return;
    }
    setNewIssue((prev) => ({ ...prev, attachment: file }));
  };

  // Handle form submission using FormData for the file attachment
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("access_token");
      const formData = new FormData();
      formData.append("title", newIssue.title);
      formData.append("description", newIssue.description);
      if (newIssue.attachment) {
        formData.append("attachment", newIssue.attachment);
      }

      const response = await axios.post(
        'http://aits-group-k-backend-7ede8a18ee73.herokuapp.com/issues/create/',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Issue created:", response.data);
      toast.success("Issue created successfully!");
      onCancel(); // Close the modal after submission
    } catch (error) {
      console.error("Error creating issue:", error);
      toast.error("Failed to create issue. Please try again.");
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
          {/* Display User Profile Info */}
          <div className="user-info">
            <p>
              <strong>Name:</strong> {userData.name || "Loading..."}
            </p>
            <p>
              <strong>Student No:</strong> {userData.studentNo || "Loading..."}
            </p>
            <p>
              <strong>College:</strong> {userData.college || "Loading..."}
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newIssue.title}
                onChange={handleInputChange}
                placeholder="Enter the issue title"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={newIssue.description}
                onChange={handleInputChange}
                placeholder="Describe the issue"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="attachment">Attachment</label>
              <input
                type="file"
                id="attachment"
                name="attachment"
                onChange={handleFileChange}
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting}>
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
