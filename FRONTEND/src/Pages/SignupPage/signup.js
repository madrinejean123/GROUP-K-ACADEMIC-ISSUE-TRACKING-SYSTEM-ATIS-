import React, { useState } from "react";
import "../SignupPage/signup.css";
import { Link } from "react-router-dom";
import Footer from "../../Components/Footer/Footer";
import SignupHeader from "../../Components/SignupHeader/SignupHeader";

const Signup = () => {
  const [role, setRole] = useState(""); 

  const [formData, setFormData] = useState({
    fullName: "",
    studentNumber: "",
    email: "",
    makEmail: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <SignupHeader />
      <div className="signup-container">
        <h2>REGISTER HERE</h2>

        {/* Role Selection */}
        <label>Select Role:</label>
        <select onChange={(e) => setRole(e.target.value)} value={role}>
          <option value="">-- Select Role --</option>
          <option value="student">Student</option>
          <option value="lecturer">Lecturer</option>
          <option value="registrar">Registrar</option>
        </select>

        <input type="text" name="fullName" placeholder="Full Name" onChange={handleChange} value={formData.fullName} required />
        
        
        {role === "student" && (
          <input type="email" name="email" placeholder="Email" onChange={handleChange} value={formData.email} required />
        )}
        
        {/* MAK Email for Lecturer and Registrar */}
        {(role === "lecturer" || role === "registrar") && (
          <input type="email" name="makEmail" placeholder="MAK Email" onChange={handleChange} value={formData.makEmail} required />
        )}
        
        <input type="password" name="password" placeholder="Password" onChange={handleChange} value={formData.password} required />
        <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} value={formData.confirmPassword} required />

        {/* Conditional Fields Based on Role */}
        {role === "student" && (
          <input type="text" name="studentNumber" placeholder="Student Number" onChange={handleChange} value={formData.studentNumber} required />
        )}

        <div className="forgot-password">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>

        <button type="submit">Sign Up</button>

        <div className="login-redirect">
          <p>Already have an account? <Link to="/IssueForm">IssueForm</Link></p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Signup;
