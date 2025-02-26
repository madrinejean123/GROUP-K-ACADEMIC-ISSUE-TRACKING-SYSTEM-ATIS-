import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Updated import
import Login from "./Authentication/login.js";
import Signup from "./Authentication/signup.jsx";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Routing for Home */}
          <Route path="/" element={<Home />} />

          {/* Routing for Login */}
          <Route path="/login" element={<Login />} />

          {/* Routing for Signup */}
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
