package com.eventify.dto;

import java.util.List;

public record SaveEventPlanRequest(String tierName, Integer price, List<String> features, Integer sortOrder) {}
