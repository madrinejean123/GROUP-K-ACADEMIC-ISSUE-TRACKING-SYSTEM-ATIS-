import { useState } from "react";
import { FaBell, FaBars, FaTimes, FaSignOutAlt, FaUser } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import "../styles/header.css";
import MakLogo from "../assets/logo.png";


const Header = ({ toggleSidebar, isMobile, sidebarOpen, userRole }) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Database data ,props or context
  const user = {
    name: `John Doe (${userRole})`,
    email: "john.doe@university.edu",
    avatar: "/placeholder.svg?height=80&width=80",
  };

  const handleLogout = () => {
    //  logout logic here
    alert("Logout clicked");
    setProfileOpen(false);
  };

  const handleMyAccount = () => {
    // navigate to account page
    alert("My Account clicked");
    setProfileOpen(false);
  };

  const handleSettings = () => {
    // open settings
    alert("Settings clicked");
    setProfileOpen(false);
  };

  const getUserInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((name) => name[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
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
              {getUserInitials(user?.name)}
            </div>
          </button>
          {profileOpen && (
            <div className="dropdown-menu profile-menu">
              <div className="profile-header">
                <img src={user?.avatar || "/placeholder.svg"} alt="Profile" />
                <div>
                  <p className="profile-name">{user?.name}</p>
                  <p className="profile-email">{user?.email}</p>
                </div>
              </div>
              <div className="profile-options">
                <button className="profile-option" onClick={handleMyAccount}>
                  <FaUser /> My Account
                </button>
                <button className="profile-option" onClick={handleSettings}>
                  <FaUser /> Settings
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
  );
};

export default Header;


