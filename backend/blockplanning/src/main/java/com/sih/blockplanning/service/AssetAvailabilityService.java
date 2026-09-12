package com.sih.blockplanning.service;

import com.sih.blockplanning.dto.response.AssetResponseDTO;
import com.sih.blockplanning.dto.response.ShadowBlockOpportunityDTO;
import com.sih.blockplanning.entity.Asset;
import com.sih.blockplanning.entity.BlockRequest;
import com.sih.blockplanning.entity.Track;
import com.sih.blockplanning.enums.BlockStatus;
import com.sih.blockplanning.repository.AssetRepository;
import com.sih.blockplanning.repository.BlockRequestRepository;
import com.sih.blockplanning.repository.TrackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

/**
 * AssetAvailabilityService implements the SIH "Shadow Blocking" feature
 * and computes track operational availability / uptime percentages.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AssetAvailabilityService {

    public static final int CRITICAL_HEALTH_THRESHOLD = 70;

    private final AssetRepository assetRepository;
    private final TrackRepository trackRepository;
    private final BlockRequestRepository blockRequestRepository;

    /**
     * Shadow Blocking Engine: Scans for other degraded assets on the same track
     * that can be serviced during the same maintenance window, saving future line closures.
     */
    public List<ShadowBlockOpportunityDTO> findShadowBlockOpportunities(Long trackId, Long currentAssetId) {
        List<Asset> trackAssets = assetRepository.findByTrackId(trackId);
        List<ShadowBlockOpportunityDTO> opportunities = new ArrayList<>();

        for (Asset asset : trackAssets) {
            // Exclude the asset already being serviced in this request
            if (currentAssetId != null && asset.getId().equals(currentAssetId)) {
                continue;
            }

            if (asset.getHealthScore() != null && asset.getHealthScore() < CRITICAL_HEALTH_THRESHOLD) {
                String reason = String.format(
                        "[%s] Health condition is %d%% (Below %d%% safety threshold). Bundling into an Integrated Mega-Block saves ~2.5 hrs of separate line closure.",
                        asset.getDepartment(), asset.getHealthScore(), CRITICAL_HEALTH_THRESHOLD
                );

                opportunities.add(ShadowBlockOpportunityDTO.builder()
                        .assetId(asset.getId())
                        .assetName(asset.getAssetName())
                        .assetType(asset.getAssetType())
                        .department(asset.getDepartment())
                        .healthScore(asset.getHealthScore())
                        .recommendationReason(reason)
                        .build());
            }
        }

        return opportunities;
    }

    /**
     * Returns all assets across the network with health scores below the threshold.
     */
    public List<AssetResponseDTO> getLowHealthAssets(int threshold) {
        return assetRepository.findByHealthScoreLessThan(threshold).stream()
                .map(this::mapToDTO)
                .toList();
    }

    /**
     * Calculates operational track availability (uptime percentage) over a given period.
     * Availability = (Total Track Hours - Approved Block Hours) / Total Track Hours * 100
     */
    public double calculateTrackAvailability(Long trackId, int horizonDays) {
        Track track = trackRepository.findById(trackId).orElse(null);
        if (track == null) return 100.0;

        double totalHours = horizonDays * 24.0;
        List<BlockRequest> approvedBlocks = blockRequestRepository.findByTrackId(trackId).stream()
                .filter(b -> b.getStatus() == BlockStatus.APPROVED || b.getStatus() == BlockStatus.COMPLETED)
                .toList();

        double totalBlockMinutes = 0.0;
        for (BlockRequest block : approvedBlocks) {
            if (block.getAllocatedStartTime() != null && block.getAllocatedEndTime() != null) {
                totalBlockMinutes += Math.max(0, Duration.between(block.getAllocatedStartTime(), block.getAllocatedEndTime()).toMinutes());
            } else if (block.getRequestedStartTime() != null && block.getRequestedEndTime() != null) {
                totalBlockMinutes += Math.max(0, Duration.between(block.getRequestedStartTime(), block.getRequestedEndTime()).toMinutes());
            }
        }

        double blockHours = totalBlockMinutes / 60.0;
        double uptimeHours = Math.max(0, totalHours - blockHours);
        double uptimePercentage = (uptimeHours / totalHours) * 100.0;

        return Math.round(uptimePercentage * 10.0) / 10.0;
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
