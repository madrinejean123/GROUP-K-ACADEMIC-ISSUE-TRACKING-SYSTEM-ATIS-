
import React, { useState } from "react";
import { useForm } from "react-hook-form"; // Import React Hook Form
import "../SignupPage/signup.css";
import { Link } from "react-router-dom";
import axios from "axios";


const USER_REGEX = /^[a-zA-Z]+(?:\s[a-zA-Z]+)+$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
const USERID_REGEX = /^\d{10}$/;


const SignUp = () => {
  // Initialize useForm hook
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm();
  const [loading,setLoading] = useState(false)

  // Handle form submission
  const onSubmit = async (data) => {
    setLoading(true)
    console.log(data);
    // Here, you can add your API call for submitting the form, for example using axios.
    // Example:
    try {
      const response = await axios.post('https://airbnb-app-chi.vercel.app/api/v1/users', data);
      console.log(response);
      if(response){
        setLoading(false)
        reset()
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setLoading(false);
    }
  };

  // Validate if the password and confirm password match
  const password = watch("password");

  return (
    <div className="signup-container">
      <h1>Welcome!</h1>
      <h2>
        Sign Up into Makerere Academic Issue Tracking System to access our
        services
      </h2>
      <form className="signup-form" onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="name">Full Name:</label>
        <input
          type="text"
          id="name"
          placeholder="Enter your name"
          {...register("name", {
            required: "Full name is required",
            pattern: { value: USER_REGEX, message: "Enter a valid full name" },
          })}
        />
        {errors.name && <p style={{ color: "red" }}>{errors.name.message}</p>}

        <label htmlFor="userId">User-ID:</label>
        <input
          type="number"
          id="userId"
          placeholder="Student No. / Staff ID"
          {...register("userId", { required: "User ID is required" })}
        />
        {errors.userId && (
          <p style={{ color: "red" }}>{errors.userId.message}</p>
        )}

        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          placeholder="Enter your Email"
          {...register("email", { required: "Email is required" })}
        />
        {errors.email && <p style={{ color: "red" }}>{errors.email.message}</p>}

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
        {errors.password && (
          <p style={{ color: "red" }}>{errors.password.message}</p>
        )}

        <label htmlFor="confirm-password">Confirm Password:</label>
        <input
          type="password"
          id="confirm-password"
          placeholder="Enter password again"
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) => value === password || "Passwords do not match",
          })}
        />
        {errors.confirmPassword && (
          <p style={{ color: "red" }}>{errors.confirmPassword.message}</p>
        )}

        {loading ? (
          <button disabled className="signup-button-loading">
            Signing in...
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
