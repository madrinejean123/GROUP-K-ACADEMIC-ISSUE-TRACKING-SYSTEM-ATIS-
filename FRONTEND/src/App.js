import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HeroPage from "./Pages/WelcomePage/HeroPage";
import Signup from "./Pages/SignupPage/signup";
import Login from "./Pages/LoginPage/login" ;
import StudentDashboard from "./Pages/StudentDashboard/Studentdashboard";


import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<HeroPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/student" element={<StudentDashboard />} />
        </Routes>
        <Toaster />
      </Router>
    </div>
  );
}

export default App;
