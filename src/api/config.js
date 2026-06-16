function defaultApiBase() {
  if (typeof window !== "undefined" && window.location?.hostname) {
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") {
      return `http://${host}:8080`;
    }
  }
  return "http://localhost:8080";
}

export function apiBase() {
  const base = process.env.REACT_APP_API_URL || defaultApiBase();
  return base.replace(/\/$/, "");
}

export function authHeader() {
  const token = localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
