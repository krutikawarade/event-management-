import { apiBase } from "./config";

async function asJsonOrThrow(res) {
  if (res.ok) return res.json();
  let message = "";
  try {
    const body = await res.json();
    message = body.message || body.error || "";
  } catch {
    try {
      const text = await res.text();
      message = text || message;
    } catch {
      // ignore
    }
  }
  const error = new Error(message || `Request failed (${res.status || "unknown status"})`);
  error.status = res.status;
  throw error;
}

export async function registerUser(payload) {
  const base = apiBase();
  if (!base) throw new Error("API unavailable");
  const res = await fetch(`${base}/api/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return asJsonOrThrow(res);
}

export async function loginUser(payload) {
  const base = apiBase();
  if (!base) throw new Error("API unavailable");
  const res = await fetch(`${base}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return asJsonOrThrow(res);
}

export async function fetchUsers() {
  const base = apiBase();
  if (!base) throw new Error("API unavailable");
  const res = await fetch(`${base}/api/users`);
  return asJsonOrThrow(res);
}

export async function createBooking(payload) {
  const base = apiBase();
  if (!base) throw new Error("API unavailable");
  const res = await fetch(`${base}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return asJsonOrThrow(res);
}

export async function fetchBookings(email) {
  const base = apiBase();
  if (!base) throw new Error("API unavailable");
  const query = email ? `?email=${encodeURIComponent(email)}` : "";
  const res = await fetch(`${base}/api/bookings${query}`);
  return asJsonOrThrow(res);
}

export async function createEvent(payload, token) {
  const base = apiBase();
  if (!base) throw new Error("API unavailable");
  const res = await fetch(`${base}/api/admin/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return asJsonOrThrow(res);
}

export async function deleteEvent(id, token) {
  const base = apiBase();
  if (!base) throw new Error("API unavailable");
  const res = await fetch(`${base}/api/admin/events/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body.message || message;
    } catch {
      // ignore
    }
    throw new Error(message || "Delete failed");
  }
}

export async function updateEventPlans(id, plans, token) {
  const base = apiBase();
  if (!base) throw new Error("API unavailable");
  const res = await fetch(`${base}/api/admin/events/${id}/plans`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(plans),
  });
  return asJsonOrThrow(res);
}
