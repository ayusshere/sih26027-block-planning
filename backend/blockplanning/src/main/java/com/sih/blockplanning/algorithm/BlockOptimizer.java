package com.sih.blockplanning.algorithm;

import com.sih.blockplanning.dto.response.SlotRecommendationDTO;
import com.sih.blockplanning.entity.BlockRequest;
import com.sih.blockplanning.entity.Schedule;
import com.sih.blockplanning.entity.Train;
import com.sih.blockplanning.enums.Priority;
import com.sih.blockplanning.repository.BlockRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * BlockOptimizer implements a heuristic sliding-window constraint-satisfaction algorithm.
 * Searches a 24-hour operational horizon to discover the Top 3 conflict-free
 * or minimum-disruption maintenance slots.
 * Prioritizes Indian Railways standard Night Lull Windows (01:00 AM - 04:30 AM).
 */
@Component
@RequiredArgsConstructor
public class BlockOptimizer {

    private static final int SEARCH_STEP_MINUTES = 30; // Candidate slot granularity
    private static final int SEARCH_HORIZON_HOURS = 24;

    private final ConflictResolver conflictResolver;
    private final PriorityScorer priorityScorer;
    private final BlockRequestRepository blockRequestRepository;

    /**
     * Discovers and ranks the Top N optimal candidate windows for a maintenance block.
     */
    public List<SlotRecommendationDTO> findOptimalSlots(
            Long trackId,
            LocalDateTime requestedStartTime,
            LocalDateTime requestedEndTime,
            int maxRecommendations
    ) {
        long durationMinutes = Duration.between(requestedStartTime, requestedEndTime).toMinutes();
        if (durationMinutes <= 0) {
            durationMinutes = 120; // Default 2-hour window fallback
        }

        LocalDateTime candidateStart = requestedStartTime.minusHours(4);
        if (requestedStartTime.isAfter(LocalDateTime.now())) {
            LocalDateTime horizonStart = LocalDateTime.now().plusMinutes(15);
            if (candidateStart.isBefore(horizonStart)) {
                candidateStart = horizonStart;
            }
        }

        // Round candidateStart to next 30-minute interval for clean timetable presentation
        candidateStart = roundToNextInterval(candidateStart, SEARCH_STEP_MINUTES);
        LocalDateTime horizonEnd = requestedStartTime.plusHours(SEARCH_HORIZON_HOURS);

        List<CandidateSlot> candidateSlots = new ArrayList<>();

        while (candidateStart.plusMinutes(durationMinutes).isBefore(horizonEnd)) {
            LocalDateTime candidateEnd = candidateStart.plusMinutes(durationMinutes);

            // 1. Hard Constraint: Reject slot if it clashes with an already APPROVED block
            List<BlockRequest> overlappingApproved = blockRequestRepository
                    .findOverlappingApprovedBlocks(trackId, candidateStart, candidateEnd);

            if (overlappingApproved.isEmpty()) {
                // 2. Soft Constraint: Evaluate train schedule conflicts & compute disruption score
                List<Schedule> clashingSchedules = conflictResolver
                        .findRawConflictingSchedules(trackId, candidateStart, candidateEnd);

                double disruptionCost = priorityScorer.calculateDisruptionCost(clashingSchedules, candidateStart, candidateEnd);
                boolean isNightLull = priorityScorer.isNightLullWindow(candidateStart, candidateEnd);
                int conflictCount = clashingSchedules.size();

                boolean hasCriticalTrain = clashingSchedules.stream().anyMatch(s -> {
                    Train t = s.getTrain();
                    return t != null && t.getPriority() == Priority.HIGH;
                });

                // Do not recommend slots that directly clash with Vande Bharat / Rajdhani if alternative exists
                double sortPenalty = disruptionCost;
                if (hasCriticalTrain) {
                    sortPenalty += 500.0;
                }
                if (isNightLull && conflictCount == 0) {
                    sortPenalty -= 20.0; // Bonus boost for conflict-free night lull
                }

                String reason = buildFeasibilityReason(clashingSchedules, isNightLull, disruptionCost);

                candidateSlots.add(new CandidateSlot(
                        candidateStart,
                        candidateEnd,
                        disruptionCost,
                        sortPenalty,
                        conflictCount,
                        isNightLull,
                        reason
                ));
            }

            candidateStart = candidateStart.plusMinutes(SEARCH_STEP_MINUTES);
        }

        // Sort candidates: Lowest sort penalty first, then proximity to requested time
        candidateSlots.sort(Comparator
                .comparingDouble((CandidateSlot s) -> s.sortPenalty)
                .thenComparingLong(s -> Math.abs(Duration.between(s.startTime, requestedStartTime).toMinutes()))
        );

        // Select distinct top recommendations spaced by at least 1 hour
        List<SlotRecommendationDTO> recommendations = new ArrayList<>();
        for (CandidateSlot slot : candidateSlots) {
            boolean tooClose = recommendations.stream().anyMatch(r ->
                    Math.abs(Duration.between(r.getProposedStartTime(), slot.startTime).toMinutes()) < 60
            );

            if (!tooClose) {
                recommendations.add(SlotRecommendationDTO.builder()
                        .proposedStartTime(slot.startTime)
                        .proposedEndTime(slot.endTime)
                        .disruptionCostScore(slot.disruptionScore)
                        .conflictingTrainsCount(slot.conflictCount)
                        .isNightLullWindow(slot.isNightLull)
                        .feasibilityReason(slot.reason)
                        .build());

                if (recommendations.size() >= maxRecommendations) {
                    break;
                }
            }
        }

        return recommendations;
    }

    private String buildFeasibilityReason(List<Schedule> schedules, boolean isNightLull, double disruptionCost) {
        if (schedules == null || schedules.isEmpty()) {
            if (isNightLull) {
                return "Optimal Night Lull Window (01:00 AM - 04:30 AM). Zero passenger and freight disruption.";
            }
            return "Conflict-free daytime traffic window. Zero passenger train impact.";
        }

        long highPriorityCount = schedules.stream()
                .filter(s -> s.getTrain() != null && s.getTrain().getPriority() == Priority.HIGH)
                .count();

        long freightCount = schedules.stream()
                .filter(s -> s.getTrain() != null && s.getTrain().getPriority() == Priority.LOW)
                .count();

        if (highPriorityCount == 0 && freightCount > 0) {
            return "Low Impact: No passenger train disruption. Requires minor rescheduling for " + freightCount + " freight train(s).";
        }

        return "Minor rescheduling required (Calculated Disruption Score: " + disruptionCost + ").";
    }

    private LocalDateTime roundToNextInterval(LocalDateTime time, int intervalMinutes) {
        int minute = time.getMinute();
        int remainder = minute % intervalMinutes;
        if (remainder == 0 && time.getSecond() == 0) {
            return time.withSecond(0).withNano(0);
        }
        return time.plusMinutes(intervalMinutes - remainder).withSecond(0).withNano(0);
    }

    private record CandidateSlot(
            LocalDateTime startTime,
            LocalDateTime endTime,
            double disruptionScore,
            double sortPenalty,
            int conflictCount,
            boolean isNightLull,
            String reason
    ) {}
}
