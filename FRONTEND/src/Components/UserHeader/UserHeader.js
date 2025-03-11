import React from "react";
import "./UserHeader.css";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import MakLogo from "../assets/logo.png";

import { IoNotificationsCircleOutline } from "react-icons/io5";
import { IoMailUnreadOutline } from "react-icons/io5";
import { IoCaretDownOutline } from "react-icons/io5";

const UserHeader = () => {
  return (
    <header className="header">
      <div className="lower">
        <div className="logo">
          <img src={MakLogo} alt="Mak Logo" />
          <h2>
            MAKERERE UNIVERSITY <span>(AITS)</span>
          </h2>
        </div>
        <div className="page-links">
          <Link to="/">HOME</Link>
          <Link to="/">DASHBOARD</Link>
          <Link to="/">ABOUT</Link>
        </div>
        <div class="profile">
          <div class="profile-info">
            <div class="initials">
              <h3>JS</h3>
            </div>
            <div class="profile-name">
              <h2>
                Junior Sam{" "}
                <button>
                  <IoCaretDownOutline />
                </button>
              </h2>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default UserHeader;
