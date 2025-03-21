import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import '../LoginPage/login.css';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaEnvelope, FaLock } from 'react-icons/fa'; 

const users = [
  {
    role: 'student',
    userId: '2400711993',
    email: 'runy23@gmail.com',
    password: 'studentPass123',
    dashboard: '/StudentDashboard',
  },
  {
    role: 'lecturer',
    userId: '',
    email: 'johndoe@mak.ac.ug',
    password: 'lecturerPass123',
    dashboard: '/LecturerDashboard',
  },
  {
    role: "registrar",
    userId: "1200713401",
    email: "timothykigozi@mak.ac.ug",
    password: "registrarPass123",
    dashboard: "/RegistrarDashboard",

  },
  {
    role: 'admin',
    userId: '2100000001',
    email: 'admin1@gmail.com',
    password: 'adminPass123',
    dashboard: '/AdminDashboard',
  },
];

const Login = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle checkbox change for Remember Me
  const handleRememberMeChange = (e) => {
    setFormData({ ...formData, rememberMe: e.target.checked });
  };

  // Handle login action
  const onSubmit = async (data) => {
    setLoading(true);
    const { email, password } = data;

    // get user by email and password
    const user = users.find(
      (user) => user.email === email && user.password === password
    );

    if (user) {
      // Redirect user based on their role and dashboard path
      toast.success('Login Successful!', {
        position: 'top-center',
        duration: 3000,
      });
      navigate(user.dashboard); // Redirect to the correct dashboard based on role
    } else {
      toast.error('Invalid credentials. Please try again.', {
        position: 'top-center',
        duration: 3000,
      });
    }

    setLoading(false);
  };

  // Handle forgot password action
  const handleForgotPassword = (e) => {
    e.preventDefault();
    console.log('Forgot password clicked');
    // Redirect or open forgot password page
  };

  // Handle sign-up action
  const handleSignUp = () => {
    navigate('/signup'); // Redirect to signup page
  };

  return (
    <>
      <div className="login-container">
        <h2>Login</h2>

        <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
          {/* Email Input */}
          <div className="input-group">
            <FaEnvelope className="icon" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              value={formData.email}
              required
            />
          </div>
          {errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}

          {/* Password Input */}
          <div className="input-group">
            <FaLock className="icon" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              value={formData.password}
              required
            />
          </div>
          {errors.password && (
            <p style={{ color: 'red' }}>{errors.password.message}</p>
          )}

          {/* Submit Buttons */}
          <div className="login-buttons">
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <button type="button" className="cancel-button">
              Cancel
            </button>
          </div>

          {/* Sign Up Link */}
          <div>
            <p>
              Don't have an account?{' '}
              <span
                onClick={handleSignUp}
                style={{ cursor: 'pointer', color: 'blue' }}
              >
                Sign Up here
              </span>
            </p>
          </div>
        </form>
      </div>
    </>
  );
};

export default Login;
