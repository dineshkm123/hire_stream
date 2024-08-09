import { useDispatch } from "react-redux";
import { authActions } from "../../store/authStore";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import authFn from "../../utils/authFn";

const SignUp = () => {
  const dispatch = useDispatch();
  const firstRef = useRef();
  const [error, setError] = useState(null);
  const [btn, setBtn] = useState(null);
  useEffect(() => firstRef.current.focus(), []);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setBtn("Creating account...");
    const fd = new FormData(e.target);
    const formData = Object.fromEntries(fd.entries());
    authFn
      .signUp({ ...formData, isadmin: false })
      .then((data) => {
        console.log(data);
        return data.json();
      })
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }
        authFn
          .login(formData.email, formData.password)
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
            if (!data.isadmin) navigate("/onboard");
          });
      })
      .catch((error) => setError(error.message))
      .finally(() => setBtn(null));
  };
  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <label htmlFor="usn">USN:</label>
        <input
          ref={firstRef}
          type="text"
          id="usn"
          name="usn"
          maxLength={11}
          minLength={10}
          required
        />

        <label htmlFor="name">Name:</label>
        <input type="text" id="name" name="name" required />

        <label htmlFor="branch">Branch:</label>
        <input type="text" id="branch" name="branch" required />

        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" required />

        <label htmlFor="phoneno">Phone No:</label>
        <input
          type="number"
          id="phoneno"
          name="phoneno"
          minLength={10}
          maxLength={10}
          required
        />

        <label htmlFor="password">Password:</label>
        <input type="password" id="password" name="password" required />

        <label htmlFor="skills">Skills:</label>
        <input type="text" id="skills" name="skills" required />

        <label htmlFor="cgpa">CGPA:</label>
        <input
          type="number"
          id="cgpa"
          name="cgpa"
          max={10}
          step=".01"
          required
        />

        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={btn}>
          {btn ? btn : "SignUp"}
        </button>
      </form>
    </div>
  );
};

export default SignUp;
