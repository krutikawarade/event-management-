const USERS_KEY = "eventify_registered_users";
const BOOKINGS_KEY = "eventify_bookings";

export function getRegisteredUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function upsertRegisteredUser({ name, email }) {
  const users = getRegisteredUsers();
  const emailLower = email.trim().toLowerCase();
  const idx = users.findIndex((u) => u.email.toLowerCase() === emailLower);
  const now = new Date().toISOString();
  if (idx >= 0) {
    users[idx] = { ...users[idx], name: name.trim(), email: email.trim() };
  } else {
    users.push({
      name: name.trim(),
      email: email.trim(),
      registeredAt: now,
    });
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  window.dispatchEvent(new Event("eventify-data-changed"));
}

export function findUserByEmail(email) {
  const e = email.trim().toLowerCase();
  return (
    getRegisteredUsers().find((u) => u.email.toLowerCase() === e) || null
  );
}

export function getBookings() {
  try {
    return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || "[]");
  } catch {
    return [];
  }
}

/** Bookings for the signed-in account (matches account or guest email). */
export function getBookingsForUser(email) {
  if (!email || typeof email !== "string") return [];
  const e = email.trim().toLowerCase();
  return getBookings().filter((b) => {
    const acc = (b.accountEmail || "").trim().toLowerCase();
    const guest = (b.guestEmail || "").trim().toLowerCase();
    return acc === e || guest === e;
  });
}

export function addBooking(record) {
  const list = getBookings();
  list.unshift(record);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("eventify-data-changed"));
}
