import React from "react";
import authFn from "../../utils/authFn";
import { useDispatch, useSelector } from "react-redux";
import { authActions } from "../../store/authStore";
import "./Account.css";

const Account = () => {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);

  const userData = user.userData || {};

  return (
    <div className="auth">
      <div className="account-container">
        <img src={userData.userimg} alt="User" className="userimg" />
        <h1>Student Information</h1>
        <div className="user-details">
          {Object.entries(userData).map(([key, value]) => {
            if (key === "userimg") return null; // Skip user image field
            return (
              <div key={key} className="usertab">
                <div className="usertab-label">
                  <strong>{key.toLocaleUpperCase()}</strong>
                </div>
                <div className="usertab-value">
                  {value !== null ? (
                    key === "resume" ? (
                      <a
                        href={value}
                        target="_blank"
                        download={userData.usn + "resume.pdf"}
                      >
                        Open Resume
                      </a>
                    ) : key === "linkedin" || key === "github" ? (
                      <a href={value} target="_blank" rel="noopener noreferrer">
                        {value}
                      </a>
                    ) : (
                      value
                    )
                  ) : (
                    "null"
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <button
        className="logout"
        onClick={() => {
          authFn.logout();
          dispatch(authActions.logout());
        }}
      >
        Log Out
      </button>
    </div>
  );
};

export default Account;
