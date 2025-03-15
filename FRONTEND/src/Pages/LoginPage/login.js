import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../LoginPage/login.css";  
import LoginHeader from '../../Components/LoginHeader/LoginHeader';
import Footer from '../../Components/Footer/Footer';
import { Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle checkbox change
  const handleRememberMeChange = (e) => {
    setFormData({ ...formData, rememberMe: e.target.checked });
  };

  // Handle login action
  const handleLogin = () => {
    console.log("Logging in with:", formData);
    // Here, you can add authentication logic
    navigate('/dashboard'); // Redirect to dashboard after login
  };

  // Handle forgot password action
  const handleForgotPassword = (e) => {
    e.preventDefault();
    console.log("Forgot password clicked");
    // Redirect or open forgot password page
  };

  // Handle sign-up action
  const handleSignUp = () => {
    navigate('/signup'); // Redirect to signup page
  };

  return (
    <>
      <LoginHeader />
      <div className="login-container">
        <h2>Login</h2>

        {/* Form Fields */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          value={formData.email}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          value={formData.password}
          required
        />

        {/* Remember Me Checkbox */}
        <div>
          <label>
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleRememberMeChange}
            />
            Remember Me
          </label>
        </div>

        {/* Login Button */}
        <button type="button" onClick={handleLogin}>
          Login
        </button>

        {/* Forgot Password Link */}
        <div>
          <p>
            <a href="#" onClick={handleForgotPassword}>
              Forgot Password? Click here!
            </a>
          </p>
        </div>

        {/* Don't have an account */}
        <div>
          <p>
            Don't have an account?{" "}
            <span onClick={handleSignUp} style={{ cursor: "pointer", color: "blue" }}>
              Sign Up here
            </span>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
