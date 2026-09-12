package com.sih.blockplanning.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IntegratedBlockDTO {
    private String trackSectionCode;
    private LocalDateTime windowStartTime;
    private LocalDateTime windowEndTime;
    private boolean isNightLull;
    private List<String> participatingDepartments;
    private List<String> bundledTasks;
    private double hoursSaved;
    private String synergyDescription;
}
