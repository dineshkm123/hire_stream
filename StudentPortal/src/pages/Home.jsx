import React from "react";
import "./Home.css";
import { Link } from "react-router-dom";
const Home = () => {
  return (
    <div className="welcome-container">
      <h1 className="title">Welcome to the Job Portal</h1>
      <p className="description">
        Your gateway to exciting career opportunities
      </p>
      <Link to="/account" className="cta-button">
        Get Started
      </Link>
    </div>
  );
};

export default Home;
