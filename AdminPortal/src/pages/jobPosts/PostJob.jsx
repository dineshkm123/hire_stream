import React, { useEffect, useState } from "react";
import "../../components/profile/Form.css";
import configFn from "../../utils/configFn";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { configActions } from "../../store/configStore";
import { getDate } from "../../../../StudentPortal/src/utils/fn";

const PostJob = () => {
  const { name } = useParams();
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(false);
  const [intialData, setIntialData] = useState({
    title: "",
    descr: "",
    employmentType: "",
    package: "",
    stipend: "",
    location: "Banglore",
    skills: "",
    applicationdeadline: "",
    eligiblebranches: "CS, ISE, AIML",
    companyname: name,
  });
  const [btn, setBtn] = useState(null);
  const state = useSelector((s) => s.auth);
  const user = state.user;
  const id = useSelector((s) => s.config.postId);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    if (id) {
      console.log(id);
      configFn
        .getDBid(id)
        .then((data) => data.json())
        .then((data) => {
          console.log(data);
          setIntialData(data[0]);
        })
        .catch((error) => setError(error));
    }
  }, [id]);

  if (state.status === "check") {
    return <>Loading...</>;
  }

  if (!user) {
    return (
      <div className="message">
        Unauthorized -{" "}
        <button className="navbar-btn" onClick={() => navigate("/account")}>
          Sign Up / Log In
        </button>{" "}
        to see Jobs available and post job.
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    if (id) {
      setBtn("Updating Post...");
    } else {
      setBtn("Creating Post...");
    }
    const fd = new FormData(e.target);
    const formData = Object.fromEntries(fd.entries());
    formData.email = user.userData.email;
    // formData.applicationdeadline = new Date(formData.applicationdeadline);
    console.log(formData.applicationdeadline);
    if (id) {
      configFn
        .updateDB(id, formData)
        .then((data) => {
          console.log(data);
          setStatus(true);
        })
        .catch((error) => setError(error.message))
        .finally(() => {
          dispatch(configActions.endEditingPost());
          setBtn(null);
        });
    } else {
      configFn
        .postDB(formData)
        .then((data) => {
          console.log(data);
          setStatus(true);
        })
        .catch((error) => setError(error.message))
        .finally(() => setBtn(null));
    }
  };

  if (status) {
    return (
      <>
        success
        <button onClick={() => setStatus(false)}>Add another post</button>
      </>
    );
  }

  return (
    <div className="form-container">
      <h2>{name}</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          name="title"
          defaultValue={intialData.title}
          required
        />

        <label htmlFor="descr">Description:</label>
        <input
          type="text"
          id="descr"
          name="descr"
          defaultValue={intialData.descr}
        />

        <label htmlFor="employmentType">Employment Type:</label>
        <input
          type="text"
          id="employmentType"
          name="employmentType"
          defaultValue={intialData.employmentType}
        />

        <label htmlFor="package">Package:</label>
        <input
          type="number"
          step={2}
          id="package"
          name="package"
          defaultValue={intialData.package}
        />

        <label htmlFor="stipend">Stipend:</label>
        <input
          type="number"
          step={2}
          id="stipend"
          name="stipend"
          defaultValue={intialData.stipend}
        />

        <label htmlFor="location">Location:</label>
        <input
          type="text"
          step={2}
          id="location"
          name="location"
          defaultValue={intialData.location}
        />

        <label htmlFor="skills">Skills (Separate by comma):</label>
        <input
          type="text"
          id="skills"
          name="skills"
          required
          defaultValue={intialData.skills}
          placeholder="Technologies (comma separated)"
        />

        <label htmlFor="applicationdeadline">Application Deadline:</label>
        <input
          type="date"
          id="applicationdeadline"
          name="applicationdeadline"
          required
          defaultValue={
            intialData.applicationdeadline &&
            getDate(intialData.applicationdeadline)
          }
        />

        <label htmlFor="eligiblebranches">
          Eligible Branches (Separate by comma):
        </label>
        <input
          type="text"
          id="eligiblebranches"
          name="eligiblebranches"
          required
          defaultValue={intialData.eligiblebranches}
          placeholder="Eligible Branches (comma separated)"
        />

        <label htmlFor="companyname">Company Name:</label>
        <input
          type="test"
          id="companyname"
          name="companyname"
          required
          defaultValue={intialData.companyname}
        />

        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={btn}>
          {btn ? btn : "Post Job"}
        </button>
      </form>
    </div>
  );
};

export default PostJob;
