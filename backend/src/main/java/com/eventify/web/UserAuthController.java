package com.eventify.web;

import com.eventify.dto.UserAuthRequest;
import com.eventify.model.AppUser;
import com.eventify.repo.AppUserRepository;
import java.time.Instant;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserAuthController {
  private final AppUserRepository appUserRepository;
  private final PasswordEncoder passwordEncoder;

  public UserAuthController(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder) {
    this.appUserRepository = appUserRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @PostMapping("/register")
  public ResponseEntity<?> register(@RequestBody UserAuthRequest body) {
    if (body == null
        || body.name() == null
        || body.email() == null
        || body.password() == null
        || body.name().isBlank()
        || body.email().isBlank()
        || body.password().isBlank()) {
      return ResponseEntity.badRequest().body(Map.of("message", "Missing registration fields"));
    }

    String email = body.email().trim().toLowerCase();
    if (appUserRepository.findByEmail(email).isPresent()) {
      return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "User already exists"));
    }

    AppUser user = new AppUser();
    user.setName(body.name().trim());
    user.setEmail(email);
    user.setPassword(passwordEncoder.encode(body.password()));
    user.setRegisteredAt(Instant.now().toString());
    appUserRepository.save(user);
    return ResponseEntity.ok(Map.of("name", user.getName(), "email", user.getEmail(), "registeredAt", user.getRegisteredAt()));
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody UserAuthRequest body) {
    if (body == null || body.email() == null || body.password() == null) {
      return ResponseEntity.badRequest().body(Map.of("message", "Missing credentials"));
    }
    String email = body.email().trim().toLowerCase();
    AppUser user = appUserRepository.findByEmail(email).orElse(null);
    if (user == null || !passwordEncoder.matches(body.password(), user.getPassword())) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password"));
    }
    return ResponseEntity.ok(Map.of("name", user.getName(), "email", user.getEmail(), "registeredAt", user.getRegisteredAt()));
  }

  @GetMapping
  public ResponseEntity<?> listUsers() {
    var users =
        appUserRepository.findAllByOrderByRegisteredAtDesc().stream()
            .map(u -> Map.of("name", u.getName(), "email", u.getEmail(), "registeredAt", u.getRegisteredAt()))
            .toList();
    return ResponseEntity.ok(users);
  }
}
