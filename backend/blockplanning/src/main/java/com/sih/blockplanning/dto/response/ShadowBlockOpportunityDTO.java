package com.sih.blockplanning.dto.response;

import com.sih.blockplanning.enums.AssetType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShadowBlockOpportunityDTO {
    private Long assetId;
    private String assetName;
    private AssetType assetType;
    private com.sih.blockplanning.enums.Department department;
    private Integer healthScore;
    private String recommendationReason;
}
