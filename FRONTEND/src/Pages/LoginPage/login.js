import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import "../LoginPage/login.css";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const users = [
  {
    role: "student",
    userId: "2400711993",
    email: "runy23@gmail.com",
    password: "studentPass123",
    dashboard: "/StudentDashboard",
  },
  {
    role: "lecturer",
    userId: "",
    email: "johndoe@mak.ac.ug",
    password: "lecturerPass123",
    dashboard: "/LecturerDashboard",
  },
  {
    role: "registrar",
    userId: "1200713401",
    email: "timothykigozi@mak.ac.com",
    password: "registrarPass123",
    dashboard: "/RegistrarDashboard",
  },
  {
    role: "admin",
    userId: "2100000001",
    email: "admin1@gmail.com",
    password: "adminPass123",
    dashboard: "/AdminDashboard",
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

  // Handle form submission
  const onSubmit = async (data) => {
    setLoading(true);
    const { email, password } = data;

    // get user by email and password
    const user = users.find(
      (user) => user.email === email && user.password === password
    );

    if (user) {
      // Redirect user based on their role and dashboard path
      toast.success("Login Successful!", {
        position: "top-center",
        duration: 3000,
      });
      navigate(user.dashboard); // Redirect to the correct dashboard based on role
    } else {
      toast.error("Invalid credentials. Please try again.", {
        position: "top-center",
        duration: 3000,
      });
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <h1>Welcome!</h1>
      <h2>Login into Makerere Academic Issue Tracking System</h2>
      <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          placeholder="Enter Your Email"
          {...register("email", { required: "Email is required" })}
        />
        {errors.email && <p style={{ color: "red" }}>{errors.email.message}</p>}

        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          placeholder="Enter Password"
          {...register("password", { required: "Password is required" })}
        />
        {errors.password && (
          <p style={{ color: "red" }}>{errors.password.message}</p>
        )}

        <div className="login-buttons">
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          <button type="button" className="cancel-button">
            Cancel
          </button>
        </div>

        {/* <div className="login-options">
          <Link to="/forgot-password" className="forgot-password">
            Forgot password
          </Link>
        </div> */}
      </form>

      <p className="register-link">
        Don't have an account? <Link to="/signup">Register</Link>
      </p>
    </div>
  );
};

export default Login;
