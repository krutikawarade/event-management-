package com.eventify.repo;

import com.eventify.model.AdminAccount;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class AdminAccountRepository {
  private static final RowMapper<AdminAccount> ADMIN_ROW_MAPPER = AdminAccountRepository::mapAdmin;

  private final JdbcTemplate jdbcTemplate;

  public AdminAccountRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public Optional<AdminAccount> findByUsername(String username) {
    List<AdminAccount> admins =
        jdbcTemplate.query(
            "SELECT id, username, password FROM admin_accounts WHERE username = ?",
            ADMIN_ROW_MAPPER,
            username);
    return admins.stream().findFirst();
  }

  public AdminAccount save(AdminAccount adminAccount) {
    if (adminAccount.getId() == null) {
      jdbcTemplate.update(
          "INSERT INTO admin_accounts (username, password) VALUES (?, ?)",
          adminAccount.getUsername(),
          adminAccount.getPassword());
      Long id =
          jdbcTemplate.queryForObject(
              "SELECT id FROM admin_accounts WHERE username = ?",
              Long.class,
              adminAccount.getUsername());
      adminAccount.setId(id);
      return adminAccount;
    }

    jdbcTemplate.update(
        "UPDATE admin_accounts SET username = ?, password = ? WHERE id = ?",
        adminAccount.getUsername(),
        adminAccount.getPassword(),
        adminAccount.getId());
    return adminAccount;
  }

  public long count() {
    Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM admin_accounts", Long.class);
    return count == null ? 0L : count;
  }

  private static AdminAccount mapAdmin(ResultSet rs, int rowNum) throws SQLException {
    AdminAccount admin = new AdminAccount();
    admin.setId(rs.getLong("id"));
    admin.setUsername(rs.getString("username"));
    admin.setPassword(rs.getString("password"));
    return admin;
  }
}
