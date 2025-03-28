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

const Sidebar = ({ sidebarOpen, userRole }) => {
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

  // props or context
  const user = {
    name: `John Doe (${userRole})`,
    id: userRole === "Student" ? "Student #12345678" : userRole,
    avatar: "/placeholder.svg?height=80&width=80",
  };

  const handleNavItemClick = (item) => {
    setActiveNavItem(item);

    // Dispatch a custom event
    const event = new CustomEvent("sidebarNavigation", {
      detail: { navItem: item },
    });
    window.dispatchEvent(event);
  };

  // navigation items based on user role
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
      default: // Student
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
              <a href="#" onClick={() => handleNavItemClick(item.id)}>
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
              <a href="#" onClick={() => handleNavItemClick(item.id)}>
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
