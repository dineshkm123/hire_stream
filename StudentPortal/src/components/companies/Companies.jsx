import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import configFn from "../../utils/configFn";

const Companies = () => {
  const [comps, setComps] = useState([]);
  useEffect(() => {
    configFn
      .getAllComapnies()
      .then((d) => d.json())
      .then((d) => setComps(d))
      .catch((e) => console.log("Error:", e.message));
  }, []);
  const navigate = useNavigate();
  return (
    <div>
      {comps.map((comp) => (
        <div className="job-card" key={comp.name}>
          <h2>{comp.name}</h2>
          <p className="truncated">{comp.descr}</p>
          <button onClick={() => navigate(comp.name)}>View more</button>
        </div>
      ))}
    </div>
  );
};

export default Companies;
