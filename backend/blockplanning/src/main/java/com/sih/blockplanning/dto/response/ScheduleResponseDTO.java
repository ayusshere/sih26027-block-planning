package com.sih.blockplanning.dto.response;

import com.sih.blockplanning.enums.Priority;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleResponseDTO {
    private Long id;
    private Long trainId;
    private String trainNumber;
    private String trainName;
    private String trainType;
    private Priority trainPriority;
    private Long trackId;
    private String trackSectionCode;
    private LocalDateTime entryTime;
    private LocalDateTime exitTime;
    private String status;
}
