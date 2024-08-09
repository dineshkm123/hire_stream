// import jwt from "jsonwebtoken";
import { decodeToken } from "react-jwt";
const token = import.meta.env.VITE_JWT_PRIVATEKEY;

const authFn = {
  signUp: async function (obj) {
    console.log(JSON.stringify(obj));
    return fetch(import.meta.env.VITE_BACKEND_API_URL + "/user/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(obj),
    });
  },

  login: async function (email, password) {
    return fetch(import.meta.env.VITE_BACKEND_API_URL + "/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({ email, password }),
    });
  },

  getCurrentUser: function () {
    const cookies = localStorage.getItem("auth");
    let myDecodedToken;
    if (cookies) {
      myDecodedToken = decodeToken(cookies);
    }
    console.log(myDecodedToken);
    return myDecodedToken;
    // console.log(jwt.verify(cookies, import.meta.env.VITE_JWT_PRIVATEKEY));
    // return jwt.verify(cookies, import.meta.env.VITE_JWT_PRIVATEKEY);
  },

  logout: function () {
    localStorage.removeItem("auth");
  },
};

export default authFn;
