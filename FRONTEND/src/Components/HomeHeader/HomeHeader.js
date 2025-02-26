import React from "react";
import "./HomeHeader.css";
import { MdAddCall } from "react-icons/md";
import { FaSquareXTwitter } from "react-icons/fa6";
import { FaSquareFacebook } from "react-icons/fa6";
import { FaSquareWhatsapp } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";
import MakLogo from "../assets/logo.png"

const HomeHeader = () => {
  return (
    <header className="header">
      <div className="upper">
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
      </div>
      <div className="lower">
        <div className="logo">
          <img src={MakLogo} />
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
          <a href="/login.html">
            <button className="login" type="submit">
              <FaUser /> Login
            </button>
          </a>

          <a href="/signup.html">
            <button className="signup" type="submit">
              Sign Up
            </button>
          </a>
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
