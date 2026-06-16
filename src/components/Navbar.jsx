import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { role, isAdmin, isUserLoggedIn, userProfile, logout } = useAuth();

  return (
    <header className="navbar">
      <Link to="/" className="logo">
        Co-Eventify
      </Link>

      <nav className="nav-links" aria-label="Main">
        <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")} end>
          Home
        </NavLink>

        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Admin
          </NavLink>
        )}

        {!role && (
          <NavLink
            to="/auth"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Login / Register
          </NavLink>
        )}

        {isUserLoggedIn && (
          <>
            <NavLink
              to="/my-bookings"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              My bookings
            </NavLink>
            <span className="nav-user" title={userProfile?.email}>
              Hi, {userProfile?.name?.split(" ")[0] || "there"}
            </span>
          </>
        )}

        {!role && (
          <Link to="/admin-login" className="nav-admin-link">
            Admin login
          </Link>
        )}

        {role && (
          <button type="button" className="nav-logout" onClick={logout}>
            Log out
          </button>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
