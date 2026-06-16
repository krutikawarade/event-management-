package com.eventify.repo;

import com.eventify.model.Event;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class EventRepository {
  private static final RowMapper<Event> EVENT_ROW_MAPPER = EventRepository::mapEvent;

  private final JdbcTemplate jdbcTemplate;

  public EventRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public List<Event> findAllByOrderByIdAsc() {
    return jdbcTemplate.query(
        "SELECT id, category, sub_event, title, event_date, location, image_key, total_tickets FROM events ORDER BY id ASC",
        EVENT_ROW_MAPPER);
  }

  public Optional<Event> findById(Long id) {
    List<Event> results =
        jdbcTemplate.query(
            "SELECT id, category, sub_event, title, event_date, location, image_key, total_tickets FROM events WHERE id = ?",
            EVENT_ROW_MAPPER,
            id);
    return results.stream().findFirst();
  }

  public Event save(Event event) {
    int updated =
        jdbcTemplate.update(
            "UPDATE events SET category = ?, sub_event = ?, title = ?, event_date = ?, location = ?, image_key = ?, total_tickets = ? WHERE id = ?",
            event.getCategory(),
            event.getSubEvent(),
            event.getTitle(),
            event.getDate(),
            event.getLocation(),
            event.getImageKey(),
            event.getTotalTickets(),
            event.getId());
    if (updated == 0) {
      jdbcTemplate.update(
          "INSERT INTO events (id, category, sub_event, title, event_date, location, image_key, total_tickets) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          event.getId(),
          event.getCategory(),
          event.getSubEvent(),
          event.getTitle(),
          event.getDate(),
          event.getLocation(),
          event.getImageKey(),
          event.getTotalTickets());
    }
    return event;
  }

  public long count() {
    Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM events", Long.class);
    return count == null ? 0L : count;
  }

  public void updateTotalTickets(Long id, Integer totalTickets) {
    jdbcTemplate.update("UPDATE events SET total_tickets = ? WHERE id = ?", totalTickets, id);
  }

  public long nextId() {
    Long nextId = jdbcTemplate.queryForObject("SELECT COALESCE(MAX(id), 0) + 1 FROM events", Long.class);
    return nextId == null ? 1L : nextId;
  }

  public void deleteById(Long id) {
    jdbcTemplate.update("DELETE FROM events WHERE id = ?", id);
  }

  private static Event mapEvent(ResultSet rs, int rowNum) throws SQLException {
    Event event = new Event();
    event.setId(rs.getLong("id"));
    event.setCategory(rs.getString("category"));
    event.setSubEvent(rs.getString("sub_event"));
    event.setTitle(rs.getString("title"));
    event.setDate(rs.getString("event_date"));
    event.setLocation(rs.getString("location"));
    event.setImageKey(rs.getString("image_key"));
    event.setTotalTickets(rs.getInt("total_tickets"));
    return event;
  }
}
