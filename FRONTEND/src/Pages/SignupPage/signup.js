import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "../SignupPage/signup.css";

// Regular expressions for validation
const USER_REGEX = /^[a-zA-Z]+(?:\s[a-zA-Z]+)+$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
const USERID_REGEX = /^\d{10}$/;

const SignUp = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(""); // For handling the user role

  // Password watch to validate confirm password
  const password = watch("password");

  // Handle form submission
  const onSubmit = async (data) => {
    setLoading(true);
    console.log(data);

    try {
      const response = await axios.post("https://app/api/v1/users", data);
      console.log(response);
      if (response) {
        setLoading(false);
        reset();
        toast.success("Signed Up Successfully", {
          position: "top-center",
          duration: 3000,
        });
        window.location.href = "/login"; // Redirect to login page
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setLoading(false);
      toast.error("Failed to SignUp", {
        position: "top-center",
        duration: 3000,
      });
    }
  };

  return (
    <div className="signup-container">
      <h2>REGISTER HERE</h2>

      <form className="signup-form" onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="fullName">Full Name:</label>
        <input
          type="text"
          id="fullName"
          placeholder="Enter your full name"
          {...register("fullName", {
            required: "Full name is required",
            pattern: { value: USER_REGEX, message: "Enter a valid full name" },
          })}
        />
        {errors.fullName && <p style={{ color: "red" }}>{errors.fullName.message}</p>}

        <label htmlFor="userId">User-ID:</label>
        <input
          type="number"
          id="userId"
          placeholder="Student No. / Staff ID"
          {...register("userId", {
            required: "User ID is required",
            pattern: { value: USERID_REGEX, message: "Enter a valid userId" },
          })}
        />
        {errors.userId && <p style={{ color: "red" }}>{errors.userId.message}</p>}

        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          placeholder="Enter your Email"
          {...register("email", { required: "Email is required" })}
        />
        {errors.email && <p style={{ color: "red" }}>{errors.email.message}</p>}

        {/* Conditional email for role */}
        {(role === "lecturer" || role === "registrar") && (
          <input
            type="email"
            id="makEmail"
            placeholder="MAK Email"
            {...register("makEmail", { required: "MAK Email is required" })}
          />
        )}

        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          placeholder="Enter password"
          {...register("password", {
            required: "Password is required",
            pattern: {
              value: PASSWORD_REGEX,
              message:
                "Password must contain 8-16 characters, including uppercase, lowercase, numbers, and symbols",
            },
          })}
        />
        {errors.password && <p style={{ color: "red" }}>{errors.password.message}</p>}

        <label htmlFor="confirmPassword">Confirm Password:</label>
        <input
          type="password"
          id="confirmPassword"
          placeholder="Enter password again"
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) => value === password || "Passwords do not match",
          })}
        />
        {errors.confirmPassword && <p style={{ color: "red" }}>{errors.confirmPassword.message}</p>}

        {loading ? (
          <button disabled className="signup-button-loading">
            Signing up...
          </button>
        ) : (
          <button type="submit" className="signup-button">
            Sign Up
          </button>
        )}
      </form>

      <p className="login-link">
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default SignUp;
