package com.eventify.web;

import com.eventify.dto.EventDto;
import com.eventify.dto.EventPlanDto;
import com.eventify.repo.EventRepository;
import com.eventify.repo.EventPlanRepository;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/events")
public class PublicEventController {

  private final EventRepository eventRepository;
  private final EventPlanRepository eventPlanRepository;

  public PublicEventController(EventRepository eventRepository, EventPlanRepository eventPlanRepository) {
    this.eventRepository = eventRepository;
    this.eventPlanRepository = eventPlanRepository;
  }

  @GetMapping
  public List<EventDto> listAll() {
    return eventRepository.findAllByOrderByIdAsc().stream()
        .map(
            event ->
                EventDto.fromEntity(
                    event,
                    eventPlanRepository.findByEventId(event.getId()).stream()
                        .map(EventPlanDto::fromEntity)
                        .toList()))
        .toList();
  }
}
