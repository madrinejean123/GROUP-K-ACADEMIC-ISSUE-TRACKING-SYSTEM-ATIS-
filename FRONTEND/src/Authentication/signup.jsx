import React, { useState } from 'react';
import axios from 'axios';
import "./login.css";
import user_icon from "../assets/user.svg";
import email_icon from "../assets/mail-svgrepo-com.svg";
import password_icon from "../assets/image.png";

const LoginSignup = () => {
  // State management for form fields
  const [formData, setFormData] = useState({
    role: '',
    fullName: '',
    email: '',
    studentNumber: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handling form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handling form submission
  const handleSubmit = async () => {
    // Basic validation checks
    if (!formData.role || !formData.fullName || !formData.email || !formData.studentNumber || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Sending form data to backend
      const response = await axios.post('http://your-backend-api/signup', formData);

      if (response.data.success) {
        alert('Signup Successful!');
      } else {
        setError('Signup failed: ' + response.data.message);
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('An error occurred during signup. Please try again.');
    } finally {
      setLoading(false);
    }
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
          <div className='text'>Sign Up</div>
          <div className='underline'></div>
        </div>

        {/* Error Display */}
        {error && <div className='error-message'>{error}</div>}

        {/* Role Selection */}
        <div className='input-field'>
          <label htmlFor='role' className='icon'>🎓</label>
          <select id='role' name='role' className='role-select' onChange={handleChange} value={formData.role}>
            <option value='' disabled>Select your role</option>
            <option value='student'>Student</option>
            <option value='lecturer'>Lecturer</option>
            <option value='academic_registrar'>Academic Registrar</option>
          </select>
        </div>

        {/* Form Fields */}
        <div className='input-container'>
          <div className='input-field'>
            <img src={user_icon} alt='User' className='icon' />
            <input type='text' name='fullName' placeholder='Full name' onChange={handleChange} value={formData.fullName} />
          </div>
          <div className='input-field'>
            <img src={email_icon} alt='Email' className='icon' />
            <input type='email' name='email' placeholder='Enter email' onChange={handleChange} value={formData.email} />
          </div>
          <div className='input-field'>
            <img src={user_icon} alt='Student Number' className='icon' />
            <input type='text' name='studentNumber' placeholder='Student Number or Staff ID' onChange={handleChange} value={formData.studentNumber} />
          </div>
          <div className='input-field'>
            <img src={password_icon} alt='Password' className='icon' />
            <input type='password' name='password' placeholder='Enter your password' onChange={handleChange} value={formData.password} />
          </div>
          <div className='input-field'>
            <img src={password_icon} alt='Confirm Password' className='icon' />
            <input type='password' name='confirmPassword' placeholder='Confirm Password' onChange={handleChange} value={formData.confirmPassword} />
          </div>
        </div>

        <div className='forgot-password'>Lost password? <span>Click here!</span></div>

        {/* Submit Buttons */}
        <div className='submit-container'>
          <button className='submit' onClick={handleSubmit} disabled={loading}>
            {loading ? 'Signing Up...' : 'Signup'}
          </button>
          <button className='submit'>Login</button>
        </div>
      </div>

    
    </div>
  );
};

export default LoginSignup;
