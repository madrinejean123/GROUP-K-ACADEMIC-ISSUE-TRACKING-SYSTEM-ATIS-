import React from "react";
import "./HomeHeader.css";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import MakLogo from "../assets/logo.png";
// import Services from "../../Pages/ServicePage/Services";
// Resuable component
const HomeHeader = () => {
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
          <Link to="/services">SERVICES</Link>
          <Link to="/About">ABOUT</Link>
        </div>
        <div className="btns">
          <Link to="/login">
            <button className="login" type="submit">
              <FaUser /> Login
            </button>
          </Link>

          {/* Use Link here to navigate to the signup page */}
          <Link to="/signup">
            <button className="signup" type="submit">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
