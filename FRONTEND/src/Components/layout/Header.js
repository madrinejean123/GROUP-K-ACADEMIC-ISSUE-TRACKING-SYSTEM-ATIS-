import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";
import { FiSettings } from "react-icons/fi";
import { MdEmail } from "react-icons/md";
import axios from "axios";
import "../styles/header.css";
import MakLogo from "../assets/logo.png";

// Logout endpoint - adjust path if different in your backend
const LOGOUT_API_URL =
  "https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/users/logout/";

const hierarchy = { /* ... existing hierarchy object ... */ };

const Header = ({
  toggleSidebar,
  isMobile,
  sidebarOpen,
  userRole,
  profile,
}) => {
  const navigate = useNavigate();

  // State
  const [profileData, setProfileData] = useState({});
  const [colleges, setColleges] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [formData, setFormData] = useState({});

  // Fetch colleges
  useEffect(() => {
    axios
      .get(
        "https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/department/colleges/"
      )
      .then(({ data }) => setColleges(data))
      .catch((err) => console.error("Error fetching colleges:", err));
  }, []);

  // Initialize profileData & formData
  useEffect(() => {
    const initial = profile ? (Array.isArray(profile) ? profile[0] : profile) : {};
    setProfileData(initial);
    setFormData({
      ...initial,
      college: initial.college_code ? initial.college_code.toUpperCase() : "",
      school: initial.school || "",
      department: initial.department || "",
      gender: initial.gender || "",
      office: initial.office || "",
      profile_pic: initial.profile_pic || "",
      notification_email: initial.notification_email || "",
    });
  }, [profile]);

  // Helpers for cascading options
  const getInitials = (name) =>
    name
      ? name
          .trim()
          .split(" ")
          .slice(0, 2)
          .map((w) => w[0].toUpperCase())
          .join("")
      : "U";

  const schoolOptions = formData.college
    ? Object.keys(hierarchy[formData.college] || {})
    : [];
  const deptOptions =
    formData.college && formData.school
      ? hierarchy[formData.college][formData.school] || []
      : [];

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const upd = { ...prev, [name]: value };
      if (name === "college") {
        upd.school = "";
        upd.department = "";
      } else if (name === "school") {
        upd.department = "";
      }
      return upd;
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");
      const { full_name, mak_email, user_role, student_no, ...payload } = formData;
      const collegeObj = colleges.find(
        (c) => c.code.toUpperCase() === payload.college
      );
      await axios.put(
        `https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/users/profile/update_me/`,
        { ...payload, college: collegeObj ? collegeObj.id : null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Profile updated!");
      setShowProfileForm(false);
    } catch (err) {
      console.error(err);
      alert("Update failed.");
    }
  };

  // Logout user
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        await axios.post(
          LOGOUT_API_URL,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (err) {
      console.error("Logout API error:", err);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      navigate("/login");
    }
  };

  const handleMyAccount = () => {
    setShowProfileForm(true);
    setProfileOpen(false);
  };
  const handleSettings = () => {
    alert("Settings clicked");
    setProfileOpen(false);
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
                {/* Notification items... */}
              </div>
            )}
          </div>
          <div className="profile-container">
            <button
              className="profile-button"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <div className="profile-initials">
                {getInitials(profileData.full_name)}
              </div>
            </button>
            {profileOpen && (
              <div className="dropdown-menu profile-menu">
                <h2>My Account</h2>
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
            )}
          </div>
        </div>
      </header>

      {showProfileForm && (
        <div className="profile-form-container">
          <form className="profile-form" onSubmit={handleFormSubmit}>
            {/* Profile form fields... */}
          </form>
        </div>
      )}
    </>
  );
};

export default Header;
