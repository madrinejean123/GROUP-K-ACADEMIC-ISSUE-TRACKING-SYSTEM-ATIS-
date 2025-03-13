import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../LoginPage/login.css"; // You can adjust the path based on where your CSS is located.
import LoginHeader from "../../Components/LoginHeader/LoginHeader";
import Footer from "../../Components/Footer/Footer";

import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="login-container">
      <h1>Welcome!</h1>
      <h2>Login into Makerere Academic Issue Tracking System</h2>
      <form className="login-form">
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          placeholder="Enter Your Email"
          required
        />

        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          placeholder="Enter password"
          required
        />

        <div className="login-buttons">
          <button type="submit" className="login-button">
            Login
          </button>
          <button type="button" className="cancel-button">
            Cancel
          </button>
        </div>

        <div className="login-options">
          <Link to="/forgot-password" className="forgot-password">
            Forgot password
          </Link>
        </div>
      </form>
      <p className="register-link">
        Don't have an account? <Link to="/signup">Register</Link>
      </p>
    </div>
  );
};

export default Login;

// const Login = () => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   return (
//     <>
//       <LoginHeader/>
//       <div className="login-container">
//         <h2>Login</h2>
//         {/* Form Fields */}
//         <input
//           type="email"
//           name="email"
//           placeholder="Email"
//           onChange={handleChange}
//           value={formData.email}
//         />
//         <input
//           type="password"
//           name="password"
//           placeholder="Password"
//           onChange={handleChange}
//           value={formData.password}
//         />

//         {/* Remember Me Checkbox */}
//         <div>
//           <label>
//             <input
//               type="checkbox"
//               name="rememberMe"
//               checked={formData.rememberMe}
//               onChange={handleRememberMeChange}
//             />
//             Remember Me
//           </label>
//         </div>

//         {/* Login Button */}
//         <button type="button" onClick={handleLogin}>
//           Login
//         </button>

//         {/* Forgot Password Link */}
//         <div>
//           <p>
//             <a href="#" onClick={handleForgotPassword}>
//               Forgot Password? Click here!
//             </a>
//           </p>
//         </div>

//         {/* Don't have an account */}
//         <div>
//           <p>
//             Don't have an account?{" "}
//             <span onClick={handleSignUp}>Sign Up here</span>
//           </p>
//         </div>
//       </div>
//       <Footer/>
//     </>
//   );
// };

// export default Login;
