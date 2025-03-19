import { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "../styles/dashboard-layout.css";

const DashboardLayout = ({ children, userRole }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 769);
      if (window.innerWidth < 769) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    //  Add class to prevent body scrolling
    if (isMobile && !sidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  };

  return (
    <div className="dashboard">
      <Header
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        userRole={userRole}
      />
      <div className="dashboard-container">
        <Sidebar sidebarOpen={sidebarOpen} userRole={userRole} />
        <main className={`main-content ${sidebarOpen ? "" : "expanded"}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
