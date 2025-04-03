import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HeroPage from "./Pages/WelcomePage/HeroPage";
import Signup from "./Pages/SignupPage/signup";
import Login from "./Pages/LoginPage/login";
import StudentDashboard from "./Pages/StudentDashboard/Studentdashboard";
import RegistrarDashboard from "./Pages/RegistrarDashboard/Registrardashboard";
import ForgotPassword from "./Pages/Forgot_password/ForgotPassword";
import LecturerDashboard from "./Pages/LecturerDashboard/LecturerDashboard";
import Services from "./Pages/ServicePage/Services";

import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<HeroPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/services" element={<Services />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/registrar" element={<RegistrarDashboard />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/lecturer" element={<LecturerDashboard />} />
        </Routes>
        <Toaster />
      </Router>
    </div>
  );
}

export default App;
