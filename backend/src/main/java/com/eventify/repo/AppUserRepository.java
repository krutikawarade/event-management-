package com.eventify.repo;

import com.eventify.model.AppUser;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class AppUserRepository {
  private static final RowMapper<AppUser> USER_ROW_MAPPER = AppUserRepository::mapUser;
  private final JdbcTemplate jdbcTemplate;

  public AppUserRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public Optional<AppUser> findByEmail(String email) {
    List<AppUser> users =
        jdbcTemplate.query(
            "SELECT id, name, email, password, registered_at FROM users WHERE email = ?",
            USER_ROW_MAPPER,
            email);
    return users.stream().findFirst();
  }

  public List<AppUser> findAllByOrderByRegisteredAtDesc() {
    return jdbcTemplate.query(
        "SELECT id, name, email, password, registered_at FROM users ORDER BY registered_at DESC",
        USER_ROW_MAPPER);
  }

  public AppUser save(AppUser user) {
    if (user.getId() == null) {
      jdbcTemplate.update(
          "INSERT INTO users (name, email, password, registered_at) VALUES (?, ?, ?, ?)",
          user.getName(),
          user.getEmail(),
          user.getPassword(),
          user.getRegisteredAt());
      Long id =
          jdbcTemplate.queryForObject("SELECT id FROM users WHERE email = ?", Long.class, user.getEmail());
      user.setId(id);
      return user;
    }

    jdbcTemplate.update(
        "UPDATE users SET name = ?, email = ?, password = ?, registered_at = ? WHERE id = ?",
        user.getName(),
        user.getEmail(),
        user.getPassword(),
        user.getRegisteredAt(),
        user.getId());
    return user;
  }

  private static AppUser mapUser(ResultSet rs, int rowNum) throws SQLException {
    AppUser user = new AppUser();
    user.setId(rs.getLong("id"));
    user.setName(rs.getString("name"));
    user.setEmail(rs.getString("email"));
    user.setPassword(rs.getString("password"));
    user.setRegisteredAt(rs.getString("registered_at"));
    return user;
  }
}
