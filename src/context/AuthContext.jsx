import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

const SESSION_USER_KEY = "eventify_session_user";

function readSessionUser() {
  try {
    const raw = localStorage.getItem(SESSION_USER_KEY);
    if (!raw) return null;
    const u = JSON.parse(raw);
    if (u && u.email) return { name: u.name || "", email: u.email };
  } catch {
    /* ignore */
  }
  return null;
}

export function AuthProvider({ children }) {
  const [role, setRole] = useState(() => localStorage.getItem("role"));
  const [adminToken, setAdminToken] = useState(() =>
    localStorage.getItem("adminToken")
  );
  const [userProfile, setUserProfile] = useState(() => readSessionUser());

  const loginAsUser = useCallback((profile) => {
    const p = {
      name: (profile.name || "").trim(),
      email: (profile.email || "").trim(),
    };
    localStorage.setItem("role", "user");
    localStorage.removeItem("adminToken");
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(p));
    setRole("user");
    setAdminToken(null);
    setUserProfile(p);
    window.dispatchEvent(new Event("auth-changed"));
  }, []);

  const loginAsAdmin = useCallback((token) => {
    localStorage.setItem("role", "admin");
    localStorage.setItem("adminToken", token);
    localStorage.removeItem(SESSION_USER_KEY);
    setRole("admin");
    setAdminToken(token);
    setUserProfile(null);
    window.dispatchEvent(new Event("auth-changed"));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("role");
    localStorage.removeItem("adminToken");
    localStorage.removeItem(SESSION_USER_KEY);
    setRole(null);
    setAdminToken(null);
    setUserProfile(null);
    window.dispatchEvent(new Event("auth-changed"));
  }, []);

  const isUserLoggedIn = role === "user" && !!userProfile?.email;
  const isAdmin = role === "admin" && !!adminToken;

  const value = useMemo(
    () => ({
      role,
      adminToken,
      userProfile,
      isUserLoggedIn,
      isAdmin,
      loginAsUser,
      loginAsAdmin,
      logout,
    }),
    [
      role,
      adminToken,
      userProfile,
      isUserLoggedIn,
      isAdmin,
      loginAsUser,
      loginAsAdmin,
      logout,
    ]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
