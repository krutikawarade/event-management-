package com.eventify.web;

import com.eventify.model.Booking;
import com.eventify.repo.BookingRepository;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
  private final BookingRepository bookingRepository;

  public BookingController(BookingRepository bookingRepository) {
    this.bookingRepository = bookingRepository;
  }

  @PostMapping
  public ResponseEntity<?> create(@RequestBody Booking booking) {
    if (booking == null
        || booking.getGuestName() == null
        || booking.getGuestEmail() == null
        || booking.getPhone() == null
        || booking.getTickets() == null
        || booking.getEventId() == null
        || booking.getEventTitle() == null
        || booking.getEventDate() == null
        || booking.getEventLocation() == null
        || booking.getPlanTier() == null
        || booking.getPlanTier().isBlank()
        || booking.getAccountEmail() == null) {
      return ResponseEntity.badRequest().body(Map.of("message", "Missing booking fields"));
    }

    if (booking.getId() == null || booking.getId().isBlank()) {
      booking.setId(UUID.randomUUID().toString());
    }
    if (booking.getBookedAt() == null || booking.getBookedAt().isBlank()) {
      booking.setBookedAt(Instant.now().toString());
    }
    bookingRepository.save(booking);
    return ResponseEntity.ok(booking);
  }

  @GetMapping
  public ResponseEntity<List<Booking>> list(@RequestParam(required = false) String email) {
    if (email != null && !email.isBlank()) {
      return ResponseEntity.ok(bookingRepository.findForUser(email.trim()));
    }
    return ResponseEntity.ok(bookingRepository.findAllByOrderByBookedAtDesc());
  }
}
