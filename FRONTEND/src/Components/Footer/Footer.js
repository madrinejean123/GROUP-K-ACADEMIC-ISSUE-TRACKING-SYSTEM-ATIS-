import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

// reusable component
const Footer = () => {
  return (
    <footer class="footer">
      <h3>&copy; 2025 MAKERERE UNIVERSITY (AITS) All rights reserved</h3>
      <p>
        <Link to="/" className="mx-4">
          Privacy/
        </Link>
        <Link to="/" className="mx-4">
          Terms&Conditions/
        </Link>
        <Link to="/" className="mx-4">
          Contact
        </Link>
      </p>
    </footer>
  );
};

export default Footer;
