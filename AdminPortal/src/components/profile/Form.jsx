import React, { useState } from "react";
import "./Form.css";
import { useSelector } from "react-redux";
import SignUp from "./SignUp";
import Login from "./Login";
import Account from "./Account";

const FormComponent = ({ loading }) => {
  const [isSignUp, setIsSignUp] = useState(false);

  const auth = useSelector((s) => s.auth.status);

  if (loading) {
    return <div>Loading....</div>;
  }

  if (auth && auth !== "check") {
    return <Account />;
  }

  return (
    <>
      <div className="linkouter">
        <span>Account {isSignUp ? "already" : "does't"} exists </span>
        <a className="inLink" onClick={() => setIsSignUp((p) => !p)}>
          {isSignUp ? "Login" : "SignUp"}
        </a>
      </div>
      {isSignUp ? <SignUp /> : <Login />}
    </>
  );
};

export default FormComponent;
