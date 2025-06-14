import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import axios from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast"; // Correct import for toast
import "../LoginPage/login.css"; // Add your custom styling
import { FaEnvelope, FaLock } from "react-icons/fa"; // Import the icons

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate(); // Initialize useNavigate for navigation

  // Handle form submission
  const onSubmit = async (data) => {
    setLoading(true);
    console.log(data);

    try {
      // Assuming the login API is at this URL
      const response = await axios.post(
        "https://aits-group-k-backen-edab8eb6b7d6.herokuapp.com/users/login/",
        data
      );

      console.log(response);
      if (response.data && response.data.tokens) {
        setLoading(false);
        reset();
        toast.success("Logged In Successfully", {
          position: "top-center",
          duration: 3000,
        });

        // Store the tokens in localStorage or cookies
        localStorage.setItem("access_token", response.data.tokens.access);
        localStorage.setItem("refresh_token", response.data.tokens.refresh);

        console.log("Access Token:", localStorage.getItem("access_token"));
        console.log("Refresh Token:", localStorage.getItem("refresh_token"));

        // Check the user's role and navigate to appropriate dashboard
        const userRole = response.data.user.user_role;
        if (userRole === "student") {
          navigate("/student");
        } else if (userRole === "lecturer") {
          navigate("/lecturer");
        } else if (userRole === "registrar") {
          navigate("/registrar");
        } else {
          navigate("/"); // Default to the home page if the role is not recognized
        }
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setLoading(false);
      toast.error("Failed to Log In", {
        position: "top-center",
        duration: 3000,
      });
    }
  };

  return (
    <div className="login-form">
      <h2>Login</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="mak_email">
            <FaEnvelope /> Email
          </label>
          <div className="input-container">
            <input
              type="email"
              id="mak_email"
              name="mak_email"
              {...register("mak_email", { required: "Email is required" })}
            />
          </div>
          {errors.mak_email && <p>{errors.mak_email.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="password">
            <FaLock /> Password
          </label>
          <div className="input-container">
            <input
              type="password"
              id="password"
              name="password"
              {...register("password", { required: "Password is required" })}
            />
          </div>
          {errors.password && <p>{errors.password.message}</p>}
        </div>

        <div className="form-group">
          <button type="submit" disabled={loading}>
            {loading ? "Logging In..." : "Log In"}
          </button>
        </div>
      </form>

      {/* Forgot Password Link */}
      <div className="forgot-password">
        <p>
          Forgot your password?{" "}
          <span
            className="forgot-password-link"
            onClick={() => navigate("/forgot-password")}
          >
            Reset it here
          </span>
        </p>
      </div>
      <div className="register">
        <p>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
