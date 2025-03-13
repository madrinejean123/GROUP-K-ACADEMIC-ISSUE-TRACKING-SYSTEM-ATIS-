
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HeroPage from "./Pages/WelcomePage/HeroPage";
import Signup from "./Pages/SignupPage/signup";
import Login from "./Pages/LoginPage/login" ;
import StudentDashboard from "./Pages/StudentDashboard/StudentDashboard";
import LecturerDashboard from "./Pages/LecturerDashboard/LecturerDashboard";
import RegistrarDashboard from "./Pages/RegistrarDashbard/RegistrarDashboard";
import Dashboard from "./Pages/mukdashboard/dashboard";



function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<HeroPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/StudentDashboard" element={<StudentDashboard />} />
          <Route path="/LecturerDashboard" element={<LecturerDashboard />} />
          <Route path="/RegistrarDashboard" element={<RegistrarDashboard />} />
          <Route path="/mukdashboard" element={<Dashboard />} />
          
        </Routes>
      </Router>
    </div>
  );
}

export default App;
