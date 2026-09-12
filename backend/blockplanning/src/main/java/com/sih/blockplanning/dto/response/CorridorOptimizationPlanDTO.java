package com.sih.blockplanning.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CorridorOptimizationPlanDTO {
    private String corridor;
    private int totalMaintenanceRequests;
    private int totalTrainsMonitored;
    private int initialConflictsDetected;
    private int initialTrainDisruptions;
    private int crossDepartmentalOverlaps;
    private int optimizedBlocksCount;
    private int finalConflictsCount;
    private int finalTrainDelaysCount;
    private long delayMinutesSaved;
    private List<IntegratedBlockDTO> integratedMegaBlocks;
    private List<BlockResponseDTO> optimizedPlan;
    private String executiveSummary;
}
