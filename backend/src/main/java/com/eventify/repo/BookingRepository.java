package com.eventify.repo;

import com.eventify.model.Booking;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class BookingRepository {
  private static final RowMapper<Booking> BOOKING_ROW_MAPPER = BookingRepository::mapBooking;
  private final JdbcTemplate jdbcTemplate;

  public BookingRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
    ensureColumns();
  }

  public Booking save(Booking booking) {
    jdbcTemplate.update(
        "INSERT INTO bookings (id, guest_name, guest_email, phone, tickets, event_id, event_title, category, event_date, event_location, plan_tier, plan_price, account_email, booked_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        booking.getId(),
        booking.getGuestName(),
        booking.getGuestEmail(),
        booking.getPhone(),
        booking.getTickets(),
        booking.getEventId(),
        booking.getEventTitle(),
        booking.getCategory(),
        booking.getEventDate(),
        booking.getEventLocation(),
        booking.getPlanTier(),
        booking.getPlanPrice(),
        booking.getAccountEmail(),
        booking.getBookedAt());
    return booking;
  }

  public List<Booking> findAllByOrderByBookedAtDesc() {
    return jdbcTemplate.query(
        "SELECT id, guest_name, guest_email, phone, tickets, event_id, event_title, category, event_date, event_location, plan_tier, plan_price, account_email, booked_at FROM bookings ORDER BY booked_at DESC",
        BOOKING_ROW_MAPPER);
  }

  public List<Booking> findForUser(String email) {
    return jdbcTemplate.query(
        "SELECT id, guest_name, guest_email, phone, tickets, event_id, event_title, category, event_date, event_location, plan_tier, plan_price, account_email, booked_at FROM bookings WHERE LOWER(account_email) = LOWER(?) OR LOWER(guest_email) = LOWER(?) ORDER BY booked_at DESC",
        BOOKING_ROW_MAPPER,
        email,
        email);
  }

  private static Booking mapBooking(ResultSet rs, int rowNum) throws SQLException {
    Booking booking = new Booking();
    booking.setId(rs.getString("id"));
    booking.setGuestName(rs.getString("guest_name"));
    booking.setGuestEmail(rs.getString("guest_email"));
    booking.setPhone(rs.getString("phone"));
    booking.setTickets(rs.getInt("tickets"));
    booking.setEventId(rs.getLong("event_id"));
    booking.setEventTitle(rs.getString("event_title"));
    booking.setCategory(rs.getString("category"));
    booking.setEventDate(rs.getString("event_date"));
    booking.setEventLocation(rs.getString("event_location"));
    booking.setPlanTier(rs.getString("plan_tier"));
    booking.setPlanPrice((Integer) rs.getObject("plan_price"));
    booking.setAccountEmail(rs.getString("account_email"));
    booking.setBookedAt(rs.getString("booked_at"));
    return booking;
  }

  private void ensureColumns() {
    try {
      addColumnIfMissing("plan_tier", "ALTER TABLE bookings ADD COLUMN plan_tier VARCHAR(120)");
      addColumnIfMissing("plan_price", "ALTER TABLE bookings ADD COLUMN plan_price INT");
      addColumnIfMissing(
          "account_email", "ALTER TABLE bookings ADD COLUMN account_email VARCHAR(255) NOT NULL DEFAULT ''");
      addColumnIfMissing(
          "booked_at", "ALTER TABLE bookings ADD COLUMN booked_at VARCHAR(64) NOT NULL DEFAULT ''");
    } catch (Exception ignored) {
      // keep startup resilient for already-migrated databases
    }
  }

  private void addColumnIfMissing(String columnName, String alterSql) {
    Integer count =
        jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'bookings'
              AND COLUMN_NAME = ?
            """,
            Integer.class,
            columnName);
    if (count != null && count == 0) {
      jdbcTemplate.execute(alterSql);
    }
  }
}
