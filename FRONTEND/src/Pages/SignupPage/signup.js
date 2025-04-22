import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "../SignupPage/signup.css";
import { FaUser, FaLock, FaEnvelope, FaIdBadge } from "react-icons/fa";

// Regular expressions for the validation
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
  } = useForm({
    shouldUnregister: true,    // ← ADD THIS
  });
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("student"); // Default role as student
  const [colleges, setColleges] = useState([]); // State to store colleges

  // Password watch to validate confirm password
  const password = watch("password");

  // Fetch colleges from the backend
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await axios.get("https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/department/colleges/");
        setColleges(response.data);
      } catch (error) {
        console.error("Error fetching colleges:", error);
        toast.error("Failed to fetch colleges", {
          position: "top-center",
          duration: 3000,
          style: { backgroundColor: "red", color: "white" },
        });
      }
    };
    fetchColleges();
  }, []);

  // Handle form submission
  const onSubmit = async (data) => {
    setLoading(true);
    console.log("payload before request:", data);

    // Include the role in the data being sent to the backend
    const requestData = {
      ...data,
      user_role: role,
    };

    try {
      const response = await axios.post(
        "https://aits-group-k-backend-7ede8a18ee73.herokuapp.com/users/register/",
        requestData
      );
      console.log(response);
      setLoading(false);
      reset();
      toast.success("Signed Up Successfully", {
        position: "top-center",
        duration: 3000,
        style: { backgroundColor: "green", color: "white" },
      });
      window.location.href = "/login";
    } catch (error) {
      console.error("Error during signup:", error.response?.data || error);
      setLoading(false);
      toast.error("Failed to Sign Up", {
        position: "top-center",
        duration: 3000,
        style: { backgroundColor: "red", color: "white" },
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
        {/* Full Name */}
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

        {/* Student No (only when role=student) */}
        {role === "student" && (
          <>
            <label htmlFor="student_no">Student No:</label>
            <div className="input-group">
              <FaIdBadge className="icon" />
              <input
                type="number"
                id="student_no"
                placeholder="Student No."
                {...register("student_no", {
                  required: "Student No is required",
                  pattern: { value: USERID_REGEX, message: "Enter a valid Student No" },
                })}
              />
            </div>
            {errors.student_no && <p style={{ color: "red" }}>{errors.student_no.message}</p>}
          </>
        )}

        {/* MAK Email */}
        <label htmlFor="mak_email">MAK Email:</label>
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

        {/* College (only for registrar) */}
        {role === "registrar" && (
          <div className="input-group">
            <label htmlFor="college">College:</label>
            <select
              id="college"
              {...register("college", { required: "College selection is required" })}
            >
              <option value="">Select College</option>
              {colleges.map((college) => (
                <option key={college.id} value={college.id}>
                  {college.code} - {college.name}
                </option>
              ))}
            </select>
            {errors.college && <p style={{ color: "red" }}>{errors.college.message}</p>}
          </div>
        )}

        {/* Password */}
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

        {/* Confirm Password */}
        <label htmlFor="confirm_password">Confirm Password:</label>
        <div className="input-group">
          <FaLock className="icon" />
          <input
            type="password"
            id="confirm_password"
            placeholder="Enter password again"
            {...register("confirm_password", {
              required: "Please confirm your password",
              validate: (value) => value === password || "Passwords do not match",
            })}
          />
        </div>
        {errors.confirm_password && (
          <p style={{ color: "red" }}>{errors.confirm_password.message}</p>
        )}

        {/* Submit */}
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
