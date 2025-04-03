import React, { useEffect, useState } from "react";
import "../WelcomePage/HeroPage.css";
import { useNavigate } from "react-router-dom";

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
            <span>
              {" "}
              Log, track, resolve your academic-related concerns here.
            </span>
          </p>
          <p className="fade-in">Enhancing Academic Excellence!</p>
          <button className="cta-button" onClick={() => navigate("/signup")}>
            Get Started <FaArrowRightLong />
          </button>
        </div>
      </main>
      <div className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Issue Tracking</h3>
            <p>
              Submit and track academic issues with real-time status updates.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👨‍🏫</div>
            <h3>Role-Based Access</h3>
            <p>
              Tailored dashboards for students, lecturers, registrars, and
              administrators.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Analytics</h3>
            <p>Comprehensive reporting and analytics for administrators.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h3>Notifications</h3>
            <p>
              Stay updated with real-time notifications on issue status changes.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default HeroPage;
