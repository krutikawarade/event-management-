package com.eventify.dto;

import com.eventify.model.Event;

public record EventDto(
    Long id,
    String category,
    String subEvent,
    String title,
    String date,
    String location,
    String imageKey,
    Integer totalTickets,
    java.util.List<EventPlanDto> plans) {

  public static EventDto fromEntity(Event e, java.util.List<EventPlanDto> plans) {
    return new EventDto(
        e.getId(),
        e.getCategory(),
        e.getSubEvent(),
        e.getTitle(),
        e.getDate(),
        e.getLocation(),
        e.getImageKey(),
        e.getTotalTickets(),
        plans);
  }
}
