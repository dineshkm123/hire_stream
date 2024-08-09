import React, { useEffect, useState } from "react";
import "../../components/profile/Form.css";
import configFn from "../../utils/configFn";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { configActions } from "../../store/configStore";

const PostJob = () => {
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(false);
  const [intialData, setIntialData] = useState({
    title: "",
    descr: "",
    exp: 0,
    profile: "",
    techs: "",
    email: "",
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

  if (Object.keys(user.userData).length !== 6) {
    return (
      <div className="message">
        Unauthorized - to post job you need to be Job Provider.
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
      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          name="title"
          defaultValue={intialData.title}
          required
        />

        <label htmlFor="profile">Profile:</label>
        <input
          type="text"
          id="profile"
          name="profile"
          defaultValue={intialData.profile}
        />

        <label htmlFor="descr">Description:</label>
        <input
          type="text"
          id="descr"
          name="descr"
          defaultValue={intialData.descr}
        />

        <label htmlFor="techs">Techs (Separate by comma):</label>
        <input
          type="text"
          id="techs"
          name="techs"
          required
          defaultValue={intialData.techs}
          placeholder="Technologies (comma separated)"
        />

        <label htmlFor="exp">Experience:</label>
        <input
          type="number"
          step={1}
          id="exp"
          name="exp"
          defaultValue={intialData.exp}
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
