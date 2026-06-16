package com.eventify.dto;

public record SaveEventRequest(
    String category,
    String subEvent,
    String title,
    String date,
    String location,
    String imageKey,
    Integer totalTickets) {}
