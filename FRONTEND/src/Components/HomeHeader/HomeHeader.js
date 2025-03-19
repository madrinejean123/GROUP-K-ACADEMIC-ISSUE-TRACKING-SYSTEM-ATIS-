import React from "react";
import "./HomeHeader.css";
import { MdAddCall } from "react-icons/md";
import { FaSquareXTwitter } from "react-icons/fa6";
import { FaSquareFacebook } from "react-icons/fa6";
import { FaSquareWhatsapp } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom"; 
import MakLogo from "../assets/logo.png";

const HomeHeader = () => {
  return (
    <header className="header">
      {/* <div className="upper">
        <div className="call-us">
          <p>
            <MdAddCall />
            <span>
              Call Us: <a href="tel">+256-123-456-7890</a>
            </span>
          </p>
        </div>

        <div className="links">
          <p>REACH US:</p>
          <a href="">
            <FaSquareFacebook />
          </a>
          <a href="">
            <FaSquareWhatsapp />
          </a>
          <a href="">
            <FaSquareXTwitter />
          </a>
        </div>
      </div> */}
      <div className="lower">
        <div className="logo">
          <img src={MakLogo} alt="Mak Logo" />
          <h2>
            MAKERERE UNIVERSITY <span>(AITS)</span>
          </h2>
        </div>
        <div className="page-links">
          <a href="#">HOME</a>
          <a href="#"> SERVICES</a>
          <a href="#"> ABOUT</a>
        </div>
        <div className="btns">
          
          <Link to="/login">
            <button className="login" type="submit">
              <FaUser /> Login
            </button>
          </Link>

          {/* Use Link here to navigate to the signup page */}
          <Link to="/signup">
            <button className="signup" type="submit">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
