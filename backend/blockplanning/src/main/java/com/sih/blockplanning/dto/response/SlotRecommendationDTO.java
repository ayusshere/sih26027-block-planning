package com.sih.blockplanning.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SlotRecommendationDTO {
    private LocalDateTime proposedStartTime;
    private LocalDateTime proposedEndTime;
    private double disruptionCostScore;
    private int conflictingTrainsCount;
    private boolean isNightLullWindow;
    private String feasibilityReason;
}
