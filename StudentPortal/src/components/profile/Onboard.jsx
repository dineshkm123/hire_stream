import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { authActions } from "../../store/authStore";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import authFn from "../../utils/authFn";

const Onboard = () => {
  const dispatch = useDispatch();
  const imageRef = useRef();
  // const pdfRef = useRef();
  const [data, setData] = useState({
    github: "",
    linkedin: "",
    resume: "",
    graduateyear: new Date().getFullYear(),
  });
  const [error, setError] = useState(null);
  const [btn, setBtn] = useState(null);
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  console.log(error);
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setBtn("Updating info...");
    const imageFile = imageRef.current.files[0];
    // const pdfFile = pdfRef.current.files[0];
    // const fd = new FormData(e.target);
    // const formData = Object.fromEntries(fd.entries());

    const formData = new FormData();
    formData.userimg = imageFile;
    // formData.resume = pdfFile;
    formData.append("userimg", imageFile);
    formData.append("resume", data.resume);
    // formData.append("resume", pdfFile);
    formData.append("github", data.github);
    formData.append("linkedin", data.linkedin);
    formData.append("graduateyear", data.graduateyear);
    console.log(formData);
    authFn
      .onboard(formData, user.userData.usn)
      .then((data) => {
        console.log(data);
        return data.json();
      })
      .then((data) => {
        console.log(data);
        if (data.error) {
          throw new Error(data.error);
        }

        localStorage.setItem("auth", data.token);
        dispatch(authActions.login({ userData: authFn.getCurrentUser() }));
        setData({
          github: "",
          linkedin: "",
          graduateyear: new Date().getFullYear(),
        });
        navigate("/jobs");
      })
      .catch((error) => setError(error.message))
      .finally(() => setBtn(null));
  };

  return (
    <>
      <h1>Fill the details</h1>
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <label htmlFor="github">Github Profile Link:</label>
          <input
            type="text"
            id="github"
            name="github"
            value={data.github}
            onChange={(e) =>
              setData((p) => {
                return { ...p, github: e.target.value };
              })
            }
            required
          />

          <label htmlFor="linkedin">Linkedin Profile Link:</label>
          <input
            type="text"
            id="linkedin"
            name="linkedin"
            value={data.linkedin}
            onChange={(e) =>
              setData((p) => {
                return { ...p, linkedin: e.target.value };
              })
            }
            required
          />

          <label htmlFor="graduateyear">Graduate Year:</label>
          <input
            type="number"
            id="graduateyear"
            name="graduateyear"
            min={new Date().getFullYear() - 4}
            max={new Date().getFullYear() + 4}
            value={data.graduateyear}
            onChange={(e) =>
              setData((p) => {
                return { ...p, graduateyear: +e.target.value };
              })
            }
            required
          />

          <label htmlFor="resume">Uplode Resume Link:</label>
          {/* <input
            type="file"
            ref={pdfRef}
            id="resume"
            name="resume"
            accept="application/pdf"
            required
          /> */}
          <input
            type="text"
            id="resume"
            name="resume"
            value={data.resume}
            onChange={(e) =>
              setData((p) => {
                return { ...p, resume: e.target.value };
              })
            }
            required
          />

          <label htmlFor="userimg">Uplode Profile Image:</label>
          <input
            type="file"
            ref={imageRef}
            id="userimg"
            name="userimg"
            accept="image/*"
            required
          />

          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={btn}>
            {btn ? btn : "Update Details"}
          </button>
        </form>
      </div>
    </>
  );
};

export default Onboard;
