import React from "react";
import {
  FaHome,
  FaClipboardList,
  FaHistory,
  FaQuestionCircle,
  FaSignOutAlt,
  FaUsers,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUserCog,
} from "react-icons/fa";
import "../styles/sidebar.css";

const Sidebar = ({ sidebarOpen, userRole, profile }) => {
  const [activeNavItem, setActiveNavItem] = React.useState("dashboard");

  const getUserInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((name) => name[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const user = {
    name: profile ? `${profile.full_name} (${userRole})` : "Loading...",
    id: profile ? profile.student_no || userRole : "Loading...",
    avatar: "/placeholder.svg?height=80&width=80",
  };

  const handleNavItemClick = (item) => {
    if (item === "logout") {
      // Don't set active nav item for logout
      handleLogout();
      return;
    }

    setActiveNavItem(item);

    const event = new CustomEvent("sidebarNavigation", {
      detail: { navItem: item },
    });
    window.dispatchEvent(event);
  };

  const handleLogout = () => {
    // Clear authentication tokens/data from localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("userRole");

    // You can also make an API call to invalidate the session on the server
    // Example: fetch('/api/auth/logout', { method: 'POST' });

    // Dispatch a logout event that the parent component can listen for
    const logoutEvent = new CustomEvent("userLogout");
    window.dispatchEvent(logoutEvent);

    // Redirect to login page
    window.location.href = "/login";
  };

  const getNavItems = () => {
    const commonItems = [
      { id: "dashboard", label: "Dashboard", icon: <FaHome /> },
    ];

    switch (userRole) {
      case "Admin":
        return [
          ...commonItems,
          { id: "users", label: "Manage Users", icon: <FaUsers /> },
          {
            id: "lecturers",
            label: "Lecturers",
            icon: <FaChalkboardTeacher />,
          },
          { id: "students", label: "Students", icon: <FaUserGraduate /> },
          { id: "settings", label: "System Settings", icon: <FaUserCog /> },
        ];
      case "Registrar":
        return [
          ...commonItems,
          { id: "issues", label: "All Issues", icon: <FaClipboardList /> },
          { id: "assigned", label: "Assigned Issues", icon: <FaHistory /> },
          {
            id: "lecturers",
            label: "Lecturers",
            icon: <FaChalkboardTeacher />,
          },
        ];
      case "Lecturer":
        return [
          ...commonItems,
          {
            id: "assigned",
            label: "Assigned Issues",
            icon: <FaClipboardList />,
          },
          { id: "resolved", label: "Resolved Issues", icon: <FaHistory /> },
        ];
      default:
        return [
          ...commonItems,
          { id: "issues", label: "My Issues", icon: <FaClipboardList /> },
          { id: "history", label: "History", icon: <FaHistory /> },
        ];
    }
  };

  const getBottomNavItems = () => {
    const commonItems = [
      { id: "logout", label: "Logout", icon: <FaSignOutAlt /> },
    ];

    if (userRole === "Registrar") {
      return [
        { id: "help", label: "Help", icon: <FaQuestionCircle /> },
        ...commonItems,
      ];
    }

    return commonItems;
  };

  const navItems = getNavItems();
  const bottomNavItems = getBottomNavItems();

  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
      <div className="sidebar-user">
        <div className="sidebar-user-initials">
          {getUserInitials(user?.name)}
        </div>
        <div className="sidebar-user-info">
          <h3>{user?.name}</h3>
          <p>{user?.id}</p>
        </div>
      </div>
      <nav className="sidebar-nav">
        <ul className="sidebar-nav-main">
          {navItems.map((item) => (
            <li
              key={item.id}
              className={activeNavItem === item.id ? "active" : ""}
            >
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavItemClick(item.id);
                }}
              >
                {item.icon} {item.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="sidebar-divider"></div>
        <ul className="sidebar-nav-bottom">
          {bottomNavItems.map((item) => (
            <li
              key={item.id}
              className={activeNavItem === item.id ? "active" : ""}
            >
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavItemClick(item.id);
                }}
              >
                {item.icon} {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
