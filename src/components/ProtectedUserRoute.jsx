import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedUserRoute({ children }) {
  const { isUserLoggedIn } = useAuth();
  const location = useLocation();

  if (!isUserLoggedIn) {
    return (
      <Navigate
        to="/auth"
        replace
        state={{
          redirect: { to: location.pathname, state: location.state },
          message: "Sign in to see your bookings.",
        }}
      />
    );
  }

  return children;
}
