import React from 'react';
import "./login.css";
import user_icon from "../assets/user.svg";
import email_icon from "../assets/mail-svgrepo-com.svg";
import password_icon from "../assets/image.png";

const LoginSignup = () => {
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
          <div className='text'>Sign Up</div>
          <div className='underline'></div>
        </div>

        <div className='input-field'>
           <label htmlFor='role' className='icon'>🎓</label>
           <select id='role' className='role-select'>
              <option value='' disabled selected>Select your role</option>
              <option value='student'>Student</option>
              <option value='lecturer'>Lecturer</option>
              <option value='academic_registrar'>Academic Registrar</option>
           </select>
        </div>

        
        <div className='input-container'>
          <div className='input-field'>
            <img src={user_icon} alt='User' className='icon' />
            <input type='text' placeholder='Full name' />
          </div>
          <div className='input-field'>
            <img src={email_icon} alt='Email' className='icon' />
            <input type='email' placeholder='Enter email' />
          </div>
          <div className='input-field'>
            <img src={user_icon} alt='Student Number' className='icon' />
            <input type='text' placeholder='Student Number or Staff id' />
          </div>
          <div className='input-field'>
            <img src={password_icon} alt='Password' className='icon' />
            <input type='password' placeholder='Enter your password' />
          </div>
          <div className='input-field'>
            <img src={password_icon} alt='Confirm Password' className='icon' />
            <input type='password' placeholder='Confirm Password' />
          </div>
        </div>

        <div className='forgot-password'>Lost password? <span>Click here!</span></div>
        
        <div className='submit-container'>
          <button className='submit'>Signup</button>
          <button className='submit'>Login</button>
        </div>
      </div>

      {/* Footer Bar */}
      <div className='footer-bar'>
        <p>&copy; {new Date().getFullYear()} Makerere University | Contact: <a href='mailto:support@mak.ac.ug'>support@mak.ac.ug</a></p>
      </div>
    </div>
  );
};

export default LoginSignup;
