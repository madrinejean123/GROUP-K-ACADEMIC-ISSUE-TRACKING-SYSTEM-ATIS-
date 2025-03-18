
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HeroPage from "./Pages/WelcomePage/HeroPage";
import Signup from "./Pages/SignupPage/signup";
import Login from "./Pages/LoginPage/login" ;
import { Toaster } from "react-hot-toast";



function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<HeroPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
        <Toaster position="top-center" reverseOrder={false} />
      </Router>
    </div>
  );
}

export default App;
