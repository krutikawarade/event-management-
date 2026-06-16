package com.eventify.dto;

import com.eventify.model.EventPlan;
import java.util.List;

public record EventPlanDto(Long id, String tierName, Integer price, List<String> features, Integer sortOrder) {
  public static EventPlanDto fromEntity(EventPlan p) {
    return new EventPlanDto(p.getId(), p.getTierName(), p.getPrice(), p.getFeatures(), p.getSortOrder());
  }
}
