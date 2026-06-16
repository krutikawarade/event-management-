package com.eventify.web;

import com.eventify.dto.LoginRequest;
import com.eventify.dto.TokenResponse;
import com.eventify.repo.AdminAccountRepository;
import com.eventify.security.JwtService;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminAuthController {

  private final AdminAccountRepository adminAccountRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AdminAuthController(
      AdminAccountRepository adminAccountRepository,
      PasswordEncoder passwordEncoder,
      JwtService jwtService) {
    this.adminAccountRepository = adminAccountRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody LoginRequest body) {
    if (body.username() == null || body.password() == null) {
      return ResponseEntity.badRequest().body(Map.of("message", "Missing credentials"));
    }
    var admin =
        adminAccountRepository
            .findByUsername(body.username().trim())
            .orElse(null);
    if (admin == null || !passwordEncoder.matches(body.password(), admin.getPassword())) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("message", "Invalid username or password"));
    }
    String token = jwtService.generateToken(admin.getUsername());
    return ResponseEntity.ok(new TokenResponse(token));
  }
}
