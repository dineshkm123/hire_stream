import React, { useEffect, useState } from "react";
import "../../components/profile/Form.css";
import configFn from "../../utils/configFn";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { configActions } from "../../store/configStore";

const PostCompany = () => {
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(false);
  const [intialData, setIntialData] = useState({
    name: "",
    descr: "",
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
      setBtn("Updating Company...");
    } else {
      setBtn("Adding Company...");
    }
    const fd = new FormData(e.target);
    const formData = Object.fromEntries(fd.entries());
    if (id) {
      configFn
        .updateCompany(id, formData)
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
        .postCompany(formData)
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
        <button onClick={() => setStatus(false)}>Add another Company</button>
      </>
    );
  }

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Company Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={intialData.name}
          required
        />

        <label htmlFor="descr">Description:</label>
        <textarea
          placeholder="Enter Company Description"
          id="descr"
          name="descr"
          rows={20}
          defaultValue={intialData.descr}
          required
        />
        <br />

        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={btn}>
          {btn ? btn : "Post Job"}
        </button>
      </form>
    </div>
  );
};

export default PostCompany;
