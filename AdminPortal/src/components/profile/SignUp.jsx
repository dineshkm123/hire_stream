import { useDispatch } from "react-redux";
import { authActions } from "../../store/authStore";
import { useEffect, useRef, useState } from "react";
import authFn from "../../utils/authFn";

const SignUp = () => {
  const dispatch = useDispatch();
  const firstRef = useRef();
  const [error, setError] = useState(null);
  const [btn, setBtn] = useState(null);
  useEffect(() => firstRef.current.focus(), []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setBtn("Creating account...");
    const fd = new FormData(e.target);
    const formData = Object.fromEntries(fd.entries());
    authFn
      .signUp({ ...formData, isadmin: true })
      .then((data) => {
        console.log(data);
        return data.json();
      })
      .then((data) => {
        authFn
          .login(formData.email, formData.password)
          .then((data) => {
            console.log(data);
            return data.json();
          })
          .then((data) => {
            console.log(data);
            localStorage.setItem("auth", data.token);
            dispatch(authActions.login({ userData: authFn.getCurrentUser() }));
          });
      })
      .catch((error) => setError(error.message))
      .finally(() => setBtn(null));
  };
  return (
    <div className="form-container">
      {" "}
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name:</label>
        <input ref={firstRef} type="text" id="name" name="name" required />

        <label htmlFor="role">Role:</label>
        <input type="text" id="role" name="role" required />

        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" required />

        <label htmlFor="password">Password:</label>
        <input type="password" id="password" name="password" required />

        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={btn}>
          {btn ? btn : "SignUp"}
        </button>
      </form>
    </div>
  );
};

export default SignUp;
