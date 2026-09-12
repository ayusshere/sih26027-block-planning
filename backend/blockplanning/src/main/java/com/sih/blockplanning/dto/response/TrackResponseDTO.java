package com.sih.blockplanning.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrackResponseDTO {
    private Long id;
    private String sectionCode;
    private String startStation;
    private String endStation;
    private Double lengthKm;
    private String status;
}
