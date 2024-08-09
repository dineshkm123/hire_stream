import React, { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./JobRouter.css"; // Create a separate CSS file for styling
import { useSelector } from "react-redux";

const JobRouter = () => {
  const [row, setRow] = useState(0);
  const user = useSelector((s) => s.auth.user);
  useEffect(() => {
    if (!user) setRow(0);
    else setRow(Object.keys(user.userData).length);
  }, [user]);
  console.log(user);
  if (row === 0) {
    return <Outlet />;
  }

  return (
    <>
      <nav className="inner-nav-bar">
        <NavLink
          to="/jobs"
          className={({ isActive }) => (isActive ? "active-link" : "")}
          end
        >
          All Job Openings
        </NavLink>
        <NavLink
          to="me"
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          Jobs Applied
        </NavLink>
      </nav>
      <Outlet />
    </>
  );
};

export default JobRouter;
