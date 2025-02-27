import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../LoginPage/login.css";  // You can adjust the path based on where your CSS is located.
import LoginHeader from '../../Components/LoginHeader/LoginHeader';
import Footer from '../../Components/Footer/Footer';


const Login = () => {
  const navigate = useNavigate(); // Hook for navigation
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRememberMeChange = (e) => {
    setFormData({ ...formData, rememberMe: e.target.checked });
  };

  // Handle Login button click
  const handleLogin = () => {
    // You can add your login logic here (e.g., authentication)
    // After successful login, navigate to the homepage or dashboard
    navigate('/home'); // Navigates to the home screen after login (adjust as needed)
  };

  // Navigate to Forgot Password page
  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  // Navigate to SignUp page
  const handleSignUp = () => {
    navigate('/signup');
  };

  return (
    <>
      <LoginHeader/>
      <div className="login-container">
        <h2>Login</h2>
        {/* Form Fields */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          value={formData.email}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          value={formData.password}
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
            <span onClick={handleSignUp}>Sign Up here</span>
          </p>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default Login;
