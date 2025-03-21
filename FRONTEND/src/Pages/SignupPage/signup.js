import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "../SignupPage/signup.css";
import { FaUser, FaLock, FaEnvelope, FaIdBadge } from "react-icons/fa"; 

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
  const [role, setRole] = useState("student"); // Default role as student

  // Password watch to validate confirm password
  const password = watch("password");

  // Handle form submission
  const onSubmit = async (data) => {
    setLoading(true);
    console.log(data);

    // Include the role in the data being sent to the backend
    const requestData = {
      ...data,
      user_role: role, // Add role to the form data
    };

    try {
      const response = await axios.post("http://127.0.0.1:8000/users/register/", requestData);

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

      {/* Role Selection */}
      <div className="user_role">
        <label>user_role:</label>
        <select onChange={(e) => setRole(e.target.value)} value={role}>
          <option value="student">Student</option>
          <option value="lecturer">Lecturer</option>
          <option value="registrar">Registrar</option>
        </select>
      </div>

      <form className="signup-form" onSubmit={handleSubmit(onSubmit)}>
        {/* Full Name Field */}
<<<<<<< HEAD
        <label htmlFor="fullName">Full Name:</label>
        <div className="input-group">
          <FaUser className="icon" />
          <input
            type="text"
            id="fullName"
            placeholder="Enter your full name"
            {...register("fullName", {
              required: "Full name is required",
              pattern: { value: USER_REGEX, message: "Enter a valid full name" },
            })}
          />
        </div>
        {errors.fullName && <p style={{ color: "red" }}>{errors.fullName.message}</p>}

        {/* User ID Field */}
        <label htmlFor="userId">User-ID:</label>
        <div className="input-group">
          <FaIdBadge className="icon" />
          <input
            type="number"
            id="userId"
            placeholder="Student No. / Staff ID"
            {...register("userId", {
              required: "User ID is required",
              pattern: { value: USERID_REGEX, message: "Enter a valid userId" },
            })}
          />
        </div>
        {errors.userId && <p style={{ color: "red" }}>{errors.userId.message}</p>}

        {/* Email Field */}
        <label htmlFor="email">Email:</label>
        <div className="input-group">
          <FaEnvelope className="icon" />
          <input
            type="email"
            id="email"
            placeholder="Enter your Email"
            {...register("email", { required: "Email is required" })}
          />
        </div>
        {errors.email && <p style={{ color: "red" }}>{errors.email.message}</p>}

        {/* Conditional MAK Email Field */}
        {(role === "lecturer" || role === "registrar") && (
          <div className="input-group">
            <FaEnvelope className="icon" />
            <input
              type="email"
              id="makEmail"
              placeholder="MAK Email"
              {...register("makEmail", { required: "MAK Email is required" })}
            />
          </div>
        )}

=======
        <label htmlFor="full_name">Full Name:</label>
        <div className="input-group">
          <FaUser className="icon" />
          <input
            type="text"
            id="full_name"
            placeholder="Enter your full name"
            {...register("full_name", {
              required: "Full name is required",
              pattern: { value: USER_REGEX, message: "Enter a valid full name" },
            })}
          />
        </div>
        {errors.full_name && <p style={{ color: "red" }}>{errors.full_name.message}</p>}

        {/* User ID Field (Only for Students) */}
        {role === "student" && (
          <>
            <label htmlFor="student_no">srudent_no:</label>
            <div className="input-group">
              <FaIdBadge className="icon" />
              <input
                type="number"
                id="student_no"
                placeholder="student_no."
                {...register("student_no", {
                  required: "User ID is required",
                  pattern: { value: USERID_REGEX, message: "Enter a valid userId" },
                })}
              />
            </div>
            {errors.student_no&& <p style={{ color: "red" }}>{errors.student_no.message}</p>}
          </>
        )}

        {/* MAK Email Field (Compulsory for all) */}
        <label htmlFor="mak_email">mak_email:</label>
        <div className="input-group">
          <FaEnvelope className="icon" />
          <input
            type="email"
            id="mak_email"
            placeholder="Enter your MAK Email"
            {...register("mak_email", { required: "MAK Email is required" })}
          />
        </div>
        {errors.mak_email && <p style={{ color: "red" }}>{errors.mak_email.message}</p>}

        {/* Conditional College Field for Registrar */}
        {role === "registrar" && (
          <div className="input-group">
            <label htmlFor="college">College:</label>
            <select id="college" {...register("college", { required: "College selection is required" })}>
              <option value="">Select College</option>
              <option value="COCIS">COCIS</option>
              <option value="COBAMS">COBAMS</option>
              <option value="CONAS">CONAS</option>
              <option value="CEES">CEES</option>
              <option value="COVAB">COVAB</option>
              <option value="CNS">CNS</option>
              <option value="CHUS">CHUS</option>
            </select>
            {errors.college && <p style={{ color: "red" }}>{errors.college.message}</p>}
          </div>
        )}

>>>>>>> 495e18720fc3e464cac6e2b2e0339a7f72197b96
        {/* Password Field */}
        <label htmlFor="password">Password:</label>
        <div className="input-group">
          <FaLock className="icon" />
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
        </div>
        {errors.password && <p style={{ color: "red" }}>{errors.password.message}</p>}

        {/* Confirm Password Field */}
<<<<<<< HEAD
        <label htmlFor="confirmPassword">Confirm Password:</label>
=======
        <label htmlFor="confirm_password">confirm_password:</label>
>>>>>>> 495e18720fc3e464cac6e2b2e0339a7f72197b96
        <div className="input-group">
          <FaLock className="icon" />
          <input
            type="password"
<<<<<<< HEAD
            id="confirmPassword"
            placeholder="Enter password again"
            {...register("confirmPassword", {
=======
            id="confirm_password"
            placeholder="Enter password again"
            {...register("confirm_password", {
>>>>>>> 495e18720fc3e464cac6e2b2e0339a7f72197b96
              required: "Please confirm your password",
              validate: (value) => value === password || "Passwords do not match",
            })}
          />
        </div>
<<<<<<< HEAD
        {errors.confirmPassword && <p style={{ color: "red" }}>{errors.confirmPassword.message}</p>}
=======
        {errors.confirm_password && <p style={{ color: "red" }}>{errors.confirm_password.message}</p>}
>>>>>>> 495e18720fc3e464cac6e2b2e0339a7f72197b96

        {/* Submit Button */}
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
