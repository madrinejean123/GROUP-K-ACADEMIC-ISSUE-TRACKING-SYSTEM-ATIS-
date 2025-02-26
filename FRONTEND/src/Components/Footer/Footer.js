import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import './Footer.css';

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
}

export default Footer;
