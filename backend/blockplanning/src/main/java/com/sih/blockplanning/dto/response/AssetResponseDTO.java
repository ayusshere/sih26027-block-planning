package com.sih.blockplanning.dto.response;

import com.sih.blockplanning.enums.AssetType;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetResponseDTO {
    private Long id;
    private String assetName;
    private AssetType assetType;
    private com.sih.blockplanning.enums.Department department;
    private Integer healthScore;
    private LocalDate lastMaintenanceDate;
    private LocalDate nextScheduledMaintenance;
    private Long trackId;
    private String trackSectionCode;
}
