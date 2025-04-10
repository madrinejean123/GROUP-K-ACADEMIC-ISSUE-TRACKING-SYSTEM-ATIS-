import { useState, useEffect } from "react";
import { FaBell, FaBars, FaTimes, FaSignOutAlt, FaUser } from "react-icons/fa";
import { FiSettings } from "react-icons/fi";
import { MdEmail } from "react-icons/md";
import axios from "axios";
import "../styles/header.css";
import MakLogo from "../assets/logo.png";

const Header = ({ toggleSidebar, isMobile, sidebarOpen, userRole, profile }) => {
  // Local state to hold profile data from backend.
  const [profileData, setProfileData] = useState({});
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [colleges, setColleges] = useState([]); // State to store the list of colleges

  // Fetch colleges from the backend
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/department/colleges/");
        setColleges(response.data); // Store the list of colleges
      } catch (error) {
        console.error("Error fetching colleges:", error);
      }
    };

    fetchColleges();
  }, []);

  // Update profile data when the profile prop changes
  useEffect(() => {
    const data = profile ? (Array.isArray(profile) ? profile[0] : profile) : {};
    setProfileData(data);
    setFormData(data);
  }, [profile]);

  // Debug logs to confirm we have the right profile info.
  useEffect(() => {
    console.log("Profile Data:", profileData);
  }, [profileData]);

  // Compute initials from the full name using only the first two words.
  const getInitials = (name) => {
    if (!name || name.trim() === "") return "U"; // Fallback if name is undefined or empty
    const names = name.trim().split(" ");
    const initials = names
      .slice(0, 2) // Take only the first two words
      .map((n) => n[0].toUpperCase()) // Get the first letter of each word
      .join(""); // Combine the initials
    return initials;
  };

  const handleLogout = () => {
    alert("Logout clicked");
    setProfileOpen(false);
  };

  const handleMyAccount = () => {
    setShowProfileForm(true);
    setProfileOpen(false);
  };

  const handleSettings = () => {
    alert("Settings clicked");
    setProfileOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");

      // Exclude read-only fields from the payload.
      const { full_name, mak_email, user_role, student_no, ...updateData } = formData;

      await axios.put(
        `http://127.0.0.1:8000/users/profile/${profileData.id}/`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Profile updated successfully!");
      setShowProfileForm(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  return (
    <>
      <header className="header">
        <div className="header-left">
          {isMobile && (
            <button className="sidebar-toggle" onClick={toggleSidebar}>
              {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
          )}
          <div className="logo">
            <img src={MakLogo} alt="MUK logo" />
            <h1>MAKERERE UNIVERSITY (AITS)</h1>
          </div>
        </div>
        <div className="header-right">
          <button className="icon-button">
            <MdEmail />
          </button>
          <div className="notification-container">
            <button
              className="icon-button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <FaBell />
              <span className="notification-badge">3</span>
            </button>
            {notificationsOpen && (
              <div className="dropdown-menu notification-menu">
                <div className="notification-item">
                  <p>New issue has been assigned</p>
                  <span className="notification-time">2 hours ago</span>
                </div>
                <div className="notification-item">
                  <p>Issue #5678 has been updated</p>
                  <span className="notification-time">Yesterday</span>
                </div>
                <div className="notification-item">
                  <p>Issue #9012 has been resolved</p>
                  <span className="notification-time">2 days ago</span>
                </div>
              </div>
            )}
          </div>
          <div className="profile-container">
            <button
              className="profile-button"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <div className="profile-initials">
                {getInitials(profileData.full_name)} {/* Changed to full_name */}
              </div>
            </button>
            {profileOpen && (
              <div className="dropdown-menu profile-menu">
                <div className="profile-options">
                  <h2 style={{ color: "black" }}>My Account</h2>
                  <button className="profile-option" onClick={handleMyAccount}>
                    <FaUser /> My profile
                  </button>
                  <button className="profile-option" onClick={handleSettings}>
                    <FiSettings /> Settings
                  </button>
                  <button
                    className="profile-option logout-option"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Profile Form */}
      {showProfileForm && (
        <div className="profile-form-container">
          <form className="profile-form" onSubmit={handleFormSubmit}>
            <h2>Edit Profile</h2>

            {/* Read-only fields displayed as plain text */}
            <div className="readonly-field">
              <strong>Full Name:</strong> {formData.full_name || "N/A"} {/* Changed to full_name */}
            </div>
            <div className="readonly-field">
              <strong>Email:</strong> {formData.mak_email || "N/A"}
            </div>
            <div className="readonly-field">
              <strong>User Role:</strong> {formData.user_role || "N/A"}
            </div>
            <div className="readonly-field">
              <strong>Student No:</strong> {formData.student_no || "N/A"}
            </div>

            {/* Editable fields */}
            <label>
              College:
              <select
                name="college"
                value={formData.college || ""}
                onChange={handleInputChange}
              >
                <option value="">Select a college</option>
                {colleges.map((college) => (
                  <option key={college.id} value={college.id}>
                    {college.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Gender:
              <select
                name="gender"
                value={formData.gender || ""}
                onChange={handleInputChange}
              >
                <option value="">Select Gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </label>
            <label>
              Office:
              <input
                type="text"
                name="office"
                value={formData.office || ""}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Profile Picture URL:
              <input
                type="text"
                name="profile_pic"
                value={formData.profile_pic || ""}
                onChange={handleInputChange}
              />
            </label>
            <button type="submit">Save Changes</button>
            <button
              type="button"
              onClick={() => setShowProfileForm(false)}
              className="cancel-button"
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Header;
