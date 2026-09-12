package com.sih.blockplanning.dto.response;

import com.sih.blockplanning.enums.Priority;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConflictDetailDTO {
    private Long scheduleId;
    private String trainNumber;
    private String trainName;
    private String trainType;
    private Priority trainPriority;
    private LocalDateTime entryTime;
    private LocalDateTime exitTime;
    private long overlapDurationMinutes;
    private String severity; // CRITICAL, MODERATE, LOW
}
