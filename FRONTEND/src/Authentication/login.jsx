import React from 'react';
import "./login.css";
import email_icon from "../assets/mail-svgrepo-com.svg";
import password_icon from "../assets/image.png";

const Login = () => {
  const handleLogin = () => {
    // Add your login logic here
    console.log("Logged in");
  };

  return (
    <div className='login-page'>
      {/* Top Navigation Bar */}
      <div className='top-bar'>
        <div className='logo'>MAKERERE UNIVERSITY ACADEMIC ISSUE TRACKING SYSTEM</div>
        <div className='nav-links'>
          <a href='/home'>Home</a>
          <a href='/notifications'>Notifications</a>
          <a href='/services'>Services</a>
        </div>
      </div>

      {/* Main Login Container */}
      <div className='container'>
        <div className='header'>
          <div className='text'>Login</div>
          <div className='underline'></div>
        </div>

        <div className='input-container'>
          <div className='input-field'>
            <img src={email_icon} alt='Email' className='icon' />
            <input type='email' placeholder='Enter email' />
          </div>
          <div className='input-field'>
            <img src={password_icon} alt='Password' className='icon' />
            <input type='password' placeholder='Enter your password' />
          </div>
        </div>

        <div className='remember-me'>
          <input type='checkbox' id='remember' />
          <label htmlFor='remember'>Remember Me</label>
        </div>

        <div className='forgot-password'>Forgot password? <span>Click here!</span></div>

        <div className='submit-container'>
          <button className='submit' onClick={handleLogin}>Login</button>
        </div>

        <div className='signup-redirect'>
          Don't have an account? <a href='/signup'>Sign Up</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
