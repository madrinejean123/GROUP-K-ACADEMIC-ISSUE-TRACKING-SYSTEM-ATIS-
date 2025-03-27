import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "../Forgot_password/ForgotPassword.css";

const ForgotPassword = () => {
  const [mak_email, setMakEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      
      const response = await axios.post("http://127.0.0.1:8000/users/forgot-password/", { mak_email });
      console.log(response);
      setLoading(false);
      toast.success("Password reset link sent to your email", {
        position: "top-center",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error during password reset:", error);
      setLoading(false);
      toast.error("Failed to send password reset link", {
        position: "top-center",
        duration: 3000,
      });
    }
  };

  return (
    <div className="forgot-password-form">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="mak_email">Enter your registered MAK Email:</label>
          <input
            type="email"
            id="mak_email"
            value={mak_email}
            onChange={(e) => setMakEmail(e.target.value)}
            placeholder="Enter your MAK Email"
            required
          />
        </div>
        <div className="form-group">
          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;