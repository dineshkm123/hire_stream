import React, { useState } from "react";
import { AiOutlineCaretDown } from "react-icons/ai";
import { useSelector } from "react-redux";
import "./NavBar.css";
import { NavLink, Outlet, useNavigation } from "react-router-dom";

const NavBar = () => {
  const status = useSelector((s) => s.auth.status);
  const [showMenu, setShowMenu] = useState(false);
  const isLoading = useNavigation().state === "loading";
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <>
      {isLoading ? "Loading..." : <Outlet />}
      <nav className="navbar" onClick={toggleMenu}>
        <div className="navbar-logo" to={"/"}>
          ADMIN
        </div>
        <div className={`navbar-links ${showMenu ? "show" : ""}`}>
          <NavLink
            className={({ isActive }) => (isActive ? "active" : "")}
            to="/"
          >
            Home
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? "active" : "")}
            to="/companies"
          >
            Companies
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? "active" : "")}
            to="/students"
          >
            Students
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? "active" : "")}
            to="/account"
          >
            {status ? (
              "My Account"
            ) : (
              <button className="navbar-btn">Sign Up / Log In</button>
            )}
          </NavLink>
        </div>
        <div className={`menu-icon ${showMenu ? "rotate" : ""}`}>
          <AiOutlineCaretDown />
        </div>
      </nav>
    </>
  );
};

export default NavBar;
