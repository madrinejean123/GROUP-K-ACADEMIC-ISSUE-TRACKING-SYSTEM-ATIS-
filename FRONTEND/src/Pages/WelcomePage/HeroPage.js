import React from "react";
import "../WelcomePage/HeroPage.css";
import { useNavigate } from "react-router-dom";
// import MakLogo from "../Assets/logo.jpg";
// import { MdAddCall } from "react-icons/md";
// import { FaSquareXTwitter } from "react-icons/fa6";
// import { FaSquareFacebook } from "react-icons/fa6";
// import { FaSquareWhatsapp } from "react-icons/fa6";
// import { FaUser } from "react-icons/fa";

import LandingImg from "../../Components/assets/landing-page.jpg";
import { FaArrowRightLong } from "react-icons/fa6";
import HomeHeader from "../../Components/HomeHeader/HomeHeader";
import Footer from "../../Components/Footer/Footer";

const HeroPage = () => {
  
  const navigate = useNavigate();

  return (
    <>
      <HomeHeader />
      <main className="welcome-hero">
        <div className="left-hero">
          <img src={LandingImg} />
        </div>
        <div className="right-hero">
          <h1>
            WELCOME TO THE MAKERERE UNIVERSITY{" "}
            <span>ACADEMIC ISSUE TRACKING SYSTEM !</span>
          </h1>
          <p>
            Let's bridge the gap between students & administration...
            <span>log, track, resolve your academic related concerns here.</span>
          </p>
          <p>Enhancing Academic Excellence!</p>
          <button onClick={() => navigate("/signup")}>
            Get Started
            <FaArrowRightLong />
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default HeroPage;
