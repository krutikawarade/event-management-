package com.eventify.web;

import com.eventify.dto.EventDto;
import com.eventify.dto.EventPlanDto;
import com.eventify.dto.PatchEventRequest;
import com.eventify.dto.SaveEventPlanRequest;
import com.eventify.dto.SaveEventRequest;
import com.eventify.model.Event;
import com.eventify.model.EventPlan;
import com.eventify.repo.EventPlanRepository;
import com.eventify.repo.EventRepository;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/events")
public class AdminEventController {

  private final EventRepository eventRepository;
  private final EventPlanRepository eventPlanRepository;

  public AdminEventController(EventRepository eventRepository, EventPlanRepository eventPlanRepository) {
    this.eventRepository = eventRepository;
    this.eventPlanRepository = eventPlanRepository;
  }

  @PostMapping
  public ResponseEntity<EventDto> create(@RequestBody SaveEventRequest body) {
    Event event = new Event();
    event.setId(eventRepository.nextId());
    applyEventFields(
        event,
        body.category(),
        body.subEvent(),
        body.title(),
        body.date(),
        body.location(),
        body.imageKey(),
        body.totalTickets());
    eventRepository.save(event);
    return ResponseEntity.ok(toDto(event));
  }

  @PatchMapping("/{id}")
  public ResponseEntity<EventDto> patch(
      @PathVariable Long id, @RequestBody PatchEventRequest body) {
    return eventRepository
        .findById(id)
        .map(
            event -> {
              applyEventFields(
                  event,
                  body.category(),
                  body.subEvent(),
                  body.title(),
                  body.date(),
                  body.location(),
                  body.imageKey(),
                  body.totalTickets());
              eventRepository.save(event);
              return ResponseEntity.ok(toDto(event));
            })
        .orElse(ResponseEntity.notFound().build());
  }

  @PutMapping("/{id}/plans")
  public ResponseEntity<EventDto> replacePlans(
      @PathVariable Long id, @RequestBody List<SaveEventPlanRequest> body) {
    return eventRepository
        .findById(id)
        .map(
            event -> {
              List<EventPlan> plans =
                  (body == null ? List.<SaveEventPlanRequest>of() : body).stream()
                      .map(AdminEventController::toPlan)
                      .toList();
              eventPlanRepository.replaceForEvent(id, plans);
              return ResponseEntity.ok(toDto(event));
            })
        .orElse(ResponseEntity.notFound().build());
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    if (eventRepository.findById(id).isEmpty()) {
      return ResponseEntity.notFound().build();
    }
    eventRepository.deleteById(id);
    return ResponseEntity.noContent().build();
  }

  private static void applyEventFields(
      Event event,
      String category,
      String subEvent,
      String title,
      String date,
      String location,
      String imageKey,
      Integer totalTickets) {
    if (category != null && !category.isBlank()) {
      event.setCategory(category.trim());
    }
    if (subEvent != null) {
      String trimmedSubEvent = subEvent.trim();
      event.setSubEvent(trimmedSubEvent.isEmpty() ? null : trimmedSubEvent);
    }
    if (title != null && !title.isBlank()) {
      event.setTitle(title.trim());
    }
    if (date != null && !date.isBlank()) {
      event.setDate(date.trim());
    }
    if (location != null && !location.isBlank()) {
      event.setLocation(location.trim());
    }
    if (imageKey != null && !imageKey.isBlank()) {
      event.setImageKey(imageKey.trim());
    }
    if (totalTickets != null) {
      event.setTotalTickets(Math.max(totalTickets, 0));
    }
  }

  private EventDto toDto(Event event) {
    return EventDto.fromEntity(
        event,
        eventPlanRepository.findByEventId(event.getId()).stream().map(EventPlanDto::fromEntity).toList());
  }

  private static EventPlan toPlan(SaveEventPlanRequest req) {
    EventPlan plan = new EventPlan();
    plan.setTierName(req.tierName() == null ? "" : req.tierName().trim());
    plan.setPrice(req.price() == null ? 0 : Math.max(req.price(), 0));
    plan.setFeatures(req.features());
    plan.setSortOrder(req.sortOrder() == null ? 0 : req.sortOrder());
    return plan;
  }
}
