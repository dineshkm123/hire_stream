import { useDispatch } from "react-redux";
import { authActions } from "../../store/authStore";
import { useEffect, useRef, useState } from "react";
import authFn from "../../utils/authFn";
// import { verify } from "jsonwebtoken";

const Login = () => {
  const dispatch = useDispatch();
  const firstRef = useRef();
  const [error, setError] = useState(null);
  const [btn, setBtn] = useState(null);
  useEffect(() => {
    firstRef.current.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setBtn("Logging in...");
    const fd = new FormData(e.target);
    const formData = Object.fromEntries(fd.entries());
    authFn
      .login(formData.email, formData.password)
      .then((data) => {
        console.log(data);
        // window.location.reload();
        return data.json();
      })
      .then((data) => {
        console.log(data);
        if (data.error) {
          throw new Error(data.error);
        }
        // console.log(verify(data, process.env.VITE_JWT_PRIVATEKEY));
        // return jwt.verify(cookies, process.env.VITE_JWT_PRIVATEKEY);
        localStorage.setItem("auth", data.token);
        dispatch(authActions.login({ userData: authFn.getCurrentUser() }));
      })
      .catch((error) => setError(error.message))
      .finally(() => setBtn(null));
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email:</label>
        <input ref={firstRef} type="email" id="email" name="email" required />

        <label htmlFor="password">Password:</label>
        <input type="password" id="password" name="password" required />
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={btn}>
          {btn ? btn : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
