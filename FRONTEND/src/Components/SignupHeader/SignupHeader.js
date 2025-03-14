import React from "react";
import "./SignupHeader.css";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import MakLogo from "../assets/logo.png";

const SignupHeader = () => {
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
          <Link to="/">SERVICES</Link>
          <Link to="/">ABOUT</Link>
        </div>
        <div className="btns">
          <Link to="/SignUp">Register Here</Link>
        </div>
      </div>
    </header>
  );
};

export default SignupHeader;
