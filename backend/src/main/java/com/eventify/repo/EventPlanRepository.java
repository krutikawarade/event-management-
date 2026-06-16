package com.eventify.repo;

import com.eventify.model.EventPlan;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class EventPlanRepository {
  private static final RowMapper<EventPlan> PLAN_ROW_MAPPER = EventPlanRepository::mapPlan;
  private final JdbcTemplate jdbcTemplate;

  public EventPlanRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
    ensureTable();
  }

  public List<EventPlan> findByEventId(Long eventId) {
    return jdbcTemplate.query(
        "SELECT id, event_id, tier_name, price, features_text, sort_order FROM event_plans WHERE event_id = ? ORDER BY sort_order ASC, id ASC",
        PLAN_ROW_MAPPER,
        eventId);
  }

  public void replaceForEvent(Long eventId, List<EventPlan> plans) {
    jdbcTemplate.update("DELETE FROM event_plans WHERE event_id = ?", eventId);
    if (plans == null || plans.isEmpty()) return;
    for (EventPlan plan : plans) {
      jdbcTemplate.update(
          "INSERT INTO event_plans (event_id, tier_name, price, features_text, sort_order) VALUES (?, ?, ?, ?, ?)",
          eventId,
          plan.getTierName(),
          Math.max(plan.getPrice() == null ? 0 : plan.getPrice(), 0),
          toDbFeatures(plan.getFeatures()),
          plan.getSortOrder() == null ? 0 : plan.getSortOrder());
    }
  }

  private static EventPlan mapPlan(ResultSet rs, int rowNum) throws SQLException {
    EventPlan plan = new EventPlan();
    plan.setId(rs.getLong("id"));
    plan.setEventId(rs.getLong("event_id"));
    plan.setTierName(rs.getString("tier_name"));
    plan.setPrice(rs.getInt("price"));
    plan.setFeatures(fromDbFeatures(rs.getString("features_text")));
    plan.setSortOrder(rs.getInt("sort_order"));
    return plan;
  }

  private static String toDbFeatures(List<String> features) {
    if (features == null || features.isEmpty()) return "";
    return features.stream()
        .map(s -> s == null ? "" : s.trim())
        .filter(s -> !s.isEmpty())
        .collect(Collectors.joining("\n"));
  }

  private static List<String> fromDbFeatures(String raw) {
    if (raw == null || raw.isBlank()) return Collections.emptyList();
    return Arrays.stream(raw.split("\\R"))
        .map(String::trim)
        .filter(s -> !s.isEmpty())
        .collect(Collectors.toList());
  }

  private void ensureTable() {
    jdbcTemplate.execute(
        "CREATE TABLE IF NOT EXISTS event_plans (id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY, event_id BIGINT NOT NULL, tier_name VARCHAR(120) NOT NULL, price INT NOT NULL DEFAULT 0, features_text TEXT, sort_order INT NOT NULL DEFAULT 0)");
  }
}
