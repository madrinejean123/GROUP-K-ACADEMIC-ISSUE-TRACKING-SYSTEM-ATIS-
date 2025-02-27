import React, { useState } from "react";
import "../SignupPage/signup.css";
import { Link } from "react-router-dom";
import Footer from "../../Components/Footer/Footer";
import SignupHeader from "../../Components/SignupHeader/SignupHeader";

const Signup = () => {
  const [role, setRole] = useState(""); // Track selected role

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    studentNumber: "",
    staffId: "",
    registrarId: "",
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
        <h2>Sign Up</h2>

        {/* Role Selection */}
        <label>Select Role:</label>
        <select onChange={(e) => setRole(e.target.value)} value={role}>
          <option value="">-- Select Role --</option>
          <option value="student">Student</option>
          <option value="lecturer">Lecturer</option>
          <option value="registrar">Registrar</option>
        </select>

        
        <input type="text" name="fullName" placeholder="Full Name" onChange={handleChange} value={formData.fullName} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} value={formData.email} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} value={formData.password} required />
        <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} value={formData.confirmPassword} required />

        {/* Conditional Fields Based on Role */}
        {role === 'student' && (
          <input type="text" name="studentNumber" placeholder="Student Number" onChange={handleChange} value={formData.studentNumber} required />
        )}
        {role === 'lecturer' && (
          <input type="text" name="staffId" placeholder="Staff ID" onChange={handleChange} value={formData.staffId} required />
        )}
        {role === 'registrar' && (
          <input type="text" name="registrarId" placeholder="Registrar ID" onChange={handleChange} value={formData.registrarId} required />
        )}

        
        <div className="forgot-password">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>

        
        <button type="submit">Sign Up</button>

        
        <div className="login-redirect">
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Signup;
