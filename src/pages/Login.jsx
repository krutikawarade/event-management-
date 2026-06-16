import React from "react";
import "./Auth.css";

const Login = () => {
  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form>
        <input type="email" placeholder="Enter Email" required />
        <input type="password" placeholder="Enter Password" required />
      <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;