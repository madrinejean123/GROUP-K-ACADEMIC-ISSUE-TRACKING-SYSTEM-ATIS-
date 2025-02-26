import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HeroPage from "./Pages/WelcomePage/HeroPage";


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