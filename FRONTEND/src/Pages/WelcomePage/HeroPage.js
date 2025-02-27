import React, { useEffect, useState } from "react";
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
  const [text, setText] = useState("");
  const fullText =
    "WEELCOME TO  MAKERERE UNIVERSITY ACADEMIC ISSUE TRACKING SYSTEM!";
  let index = 0;

  useEffect(() => {
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setText((prev) => prev + fullText.charAt(index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <HomeHeader />
      <main className="welcome-hero">
        <div className="left-hero">
          <img src={LandingImg} alt="Landing" className="hero-image" />
        </div>
        <div className="right-hero">
          <h1 className="fade-in">{text}</h1>
          <p className="slide-in">
            Let's bridge the gap between students & administration...
            <span> Log, track, resolve your academic-related concerns here.</span>
          </p>
          <p className="fade-in">Enhancing Academic Excellence!</p>
          <button className="cta-button" onClick={() => navigate("/signup")}>
            Get Started <FaArrowRightLong />
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default HeroPage;
