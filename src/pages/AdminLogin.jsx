import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiBase } from "../api/config";
import "./Auth.css";
import "./AdminLogin.css";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginAsAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const base = apiBase();

    if (base) {
      setLoading(true);
      try {
        const res = await fetch(`${base}/api/admin/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.message || "Invalid credentials");
          return;
        }
        if (data.token) {
          loginAsAdmin(data.token);
          navigate("/admin");
          return;
        }
        setError("Unexpected response from server");
      } catch {
        setError(
          "Cannot reach API. Check backend is running and REACT_APP_API_URL."
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    if (username === "admin" && password === "admin123") {
      loginAsAdmin("local-dev-token");
      navigate("/admin");
      return;
    }
    setError("Invalid credentials. Offline demo: admin / admin123");
  };

  return (
    <div className="auth-page">
      <div className="auth-container admin-login-wrap">
        <div className="auth-brand">
          <span className="auth-brand-mark admin-mark">A</span>
          <div>
            <h2>Admin login</h2>
            <p className="auth-lead">
              Organiser access: update events and view registrations. Attendees
              use the regular account page.
            </p>
          </div>
        </div>

        <p className="auth-hint">
          <Link to="/auth">Attendee login / register</Link>
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label">
            Username
            <input
              type="text"
              name="username"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </label>
          <label className="auth-label">
            Password
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          {error && (
            <p className="error" style={{ textAlign: "center", marginTop: 8 }}>
              {error}
            </p>
          )}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in to admin"}
          </button>
        </form>

        <p className="toggle-text">
          <Link to="/"> Back to home</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
