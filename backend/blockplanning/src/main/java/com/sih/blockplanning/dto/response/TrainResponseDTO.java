package com.sih.blockplanning.dto.response;

import com.sih.blockplanning.enums.Priority;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainResponseDTO {
    private Long id;
    private String trainNumber;
    private String trainName;
    private String trainType;
    private Priority priority;
}
