package com.sih.blockplanning.controller;

import com.sih.blockplanning.dto.response.ApiResponse;
import com.sih.blockplanning.dto.response.AssetResponseDTO;
import com.sih.blockplanning.dto.response.ShadowBlockOpportunityDTO;
import com.sih.blockplanning.entity.Asset;
import com.sih.blockplanning.exception.ResourceNotFoundException;
import com.sih.blockplanning.repository.AssetRepository;
import com.sih.blockplanning.service.AssetAvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * AssetController exposes endpoints for railway infrastructure assets (OHE wires,
 * track circuits, signals, point machines) and health condition monitoring.
 */
@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetRepository assetRepository;
    private final AssetAvailabilityService assetAvailabilityService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AssetResponseDTO>>> getAssets(
            @RequestParam(required = false) Long trackId
    ) {
        List<Asset> assets = (trackId != null)
                ? assetRepository.findByTrackId(trackId)
                : assetRepository.findAll();

        List<AssetResponseDTO> dtos = assets.stream()
                .map(this::mapToDTO)
                .toList();

        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AssetResponseDTO>> getAssetById(@PathVariable Long id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with id: " + id));
        return ResponseEntity.ok(ApiResponse.success(mapToDTO(asset)));
    }

    @GetMapping("/health-alerts")
    public ResponseEntity<ApiResponse<List<AssetResponseDTO>>> getHealthAlerts(
            @RequestParam(defaultValue = "70") int threshold
    ) {
        List<AssetResponseDTO> lowHealthAssets = assetAvailabilityService.getLowHealthAssets(threshold);
        return ResponseEntity.ok(ApiResponse.success("Assets requiring maintenance (health < " + threshold + "%)", lowHealthAssets));
    }

    @GetMapping("/track/{trackId}/shadow-opportunities")
    public ResponseEntity<ApiResponse<List<ShadowBlockOpportunityDTO>>> getShadowOpportunities(
            @PathVariable Long trackId,
            @RequestParam(required = false) Long currentAssetId
    ) {
        List<ShadowBlockOpportunityDTO> opportunities = assetAvailabilityService
                .findShadowBlockOpportunities(trackId, currentAssetId);
        return ResponseEntity.ok(ApiResponse.success(opportunities));
    }

    private AssetResponseDTO mapToDTO(Asset asset) {
        return AssetResponseDTO.builder()
                .id(asset.getId())
                .assetName(asset.getAssetName())
                .assetType(asset.getAssetType())
                .department(asset.getDepartment())
                .healthScore(asset.getHealthScore())
                .lastMaintenanceDate(asset.getLastMaintenanceDate())
                .nextScheduledMaintenance(asset.getNextDueMaintenanceDate())
                .trackId(asset.getTrack() != null ? asset.getTrack().getId() : null)
                .trackSectionCode(asset.getTrack() != null ? asset.getTrack().getSectionCode() : "N/A")
                .build();
    }
}
