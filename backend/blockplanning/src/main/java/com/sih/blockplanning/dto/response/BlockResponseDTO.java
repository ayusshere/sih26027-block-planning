package com.sih.blockplanning.dto.response;

import com.sih.blockplanning.enums.BlockStatus;
import com.sih.blockplanning.enums.Priority;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlockResponseDTO {
    private Long id;
    private String title;
    private Long trackId;
    private String trackSectionCode;
    private String startStation;
    private String endStation;
    private com.sih.blockplanning.enums.Department department;
    private Long assetId;
    private String assetName;
    private Long requestedByUserId;
    private String requestedByUsername;
    private LocalDateTime requestedStartTime;
    private LocalDateTime requestedEndTime;
    private LocalDateTime allocatedStartTime;
    private LocalDateTime allocatedEndTime;
    private String purpose;
    private BlockStatus status;
    private Priority priority;
    private String conflictRemarks;

    // Rich AI Optimizer & SIH Intelligence fields
    private boolean hasConflict;
    private List<ConflictDetailDTO> conflicts;
    private List<SlotRecommendationDTO> recommendedSlots;
    private List<ShadowBlockOpportunityDTO> shadowBlockOpportunities;
}
