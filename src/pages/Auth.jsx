import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser, registerUser } from "../api/userBookingApi";
import "./Auth.css";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAsUser } = useAuth();

  const redirect = location.state?.redirect;
  const bannerMessage = location.state?.message;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    let newErrors = {};

    if (!isLogin && !formData.name.trim()) {
      newErrors.name = "Full Name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (
      !/^(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&]).{6,}$/.test(formData.password)
    ) {
      newErrors.password =
        "Password must be 6+ chars, include uppercase, number & special character";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goAfterAuth = () => {
    if (redirect?.to) {
      navigate(redirect.to, {
        replace: true,
        state: redirect.state ?? undefined,
      });
      return;
    }
    navigate("/", { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (isLogin) {
      try {
        const user = await loginUser({
          email: formData.email.trim(),
          password: formData.password,
        });
        loginAsUser({ name: user.name, email: user.email });
        goAfterAuth();
      } catch (err) {
        setErrors({ email: err?.message || "Login failed. Try again." });
      }
      return;
    }

    try {
      const user = await registerUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      loginAsUser({ name: user.name, email: user.email });
      goAfterAuth();
    } catch (err) {
      setErrors({ email: err?.message || "Registration failed. Try again." });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <span className="auth-brand-mark">E</span>
          <div>
            <h2>{isLogin ? "Welcome back" : "Create account"}</h2>
            <p className="auth-lead">
              {isLogin
                ? "Sign in to book events and manage your visits."
                : "Join Eventify to discover and book experiences."}
            </p>
          </div>
        </div>

        {bannerMessage && (
          <div className="auth-banner" role="status">
            {bannerMessage}
          </div>
        )}

        <p className="auth-hint">
          Organisers: use{" "}
          <Link to="/admin-login">Admin login</Link>.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <label className="auth-label">
                Full name
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  onChange={handleChange}
                  autoComplete="name"
                />
              </label>
              {errors.name && <p className="error">{errors.name}</p>}
            </>
          )}

          <label className="auth-label">
            Email
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              onChange={handleChange}
              autoComplete="email"
            />
          </label>
          {errors.email && <p className="error">{errors.email}</p>}

          <label className="auth-label">
            Password
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              onChange={handleChange}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </label>
          {errors.password && <p className="error">{errors.password}</p>}

          <button type="submit" className="auth-submit">
            {isLogin ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="toggle-text">
          {isLogin ? "New to Eventify?" : "Already registered?"}
          <button
            type="button"
            className="toggle-link"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrors({});
            }}
          >
            {isLogin ? " Create an account" : " Sign in instead"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
