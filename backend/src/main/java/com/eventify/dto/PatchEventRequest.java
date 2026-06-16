package com.eventify.dto;

public record PatchEventRequest(
    String category,
    String subEvent,
    String title,
    String date,
    String location,
    String imageKey,
    Integer totalTickets) {}
