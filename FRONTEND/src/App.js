import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// import Login from "./Pages/LoginPage/login.jsx";
// import Signup from "./Pages/SignupPage/signup.jsx";
import HeroPage from "./Pages/WelcomePage/HeroPage.js";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* <Route path="/" element={<Footer />} /> */}
          <Route path="/" element={<HeroPage />} />
          {/* <Route path="/" element={<SignupPage />} /> */}
        </Routes>
      </Router>
      {/* <Login /> */}
      {/* <Signup /> */}
    </div>
  );
}

export default App;
