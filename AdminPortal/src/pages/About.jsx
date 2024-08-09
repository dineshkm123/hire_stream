import React from "react";
import { useRouteLoaderData } from "react-router-dom";

const About = () => {
  return (
    <div style={{ width: "100%", height: "90vh", overflow: "hidden" }}>
      <iframe
        title="External Website"
        src="https://bm9avan.bio.link/"
        style={{ width: "98.8vw", height: "100%", border: "none" }}
      ></iframe>
    </div>
  );
};

export default About;
