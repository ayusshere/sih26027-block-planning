package com.sih.blockplanning.algorithm;

import com.sih.blockplanning.entity.Asset;
import com.sih.blockplanning.entity.Schedule;
import com.sih.blockplanning.enums.Priority;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * PriorityScorer computes operational disruption costs and maintenance urgency scores.
 * Uses realistic Indian Railways priority tier weights:
 * - HIGH (Vande Bharat, Rajdhani, Shatabdi): Weight 5.0
 * - MEDIUM (Mail, Express, Passenger): Weight 2.5
 * - LOW (Freight, Goods, Empty Rake): Weight 1.0
 */
@Component
public class PriorityScorer {

    public static final double HIGH_PRIORITY_WEIGHT = 5.0;
    public static final double MEDIUM_PRIORITY_WEIGHT = 2.5;
    public static final double LOW_PRIORITY_WEIGHT = 1.0;

    // Standard Indian Railways night maintenance lull window (01:00 AM - 04:30 AM)
    private static final LocalTime NIGHT_LULL_START = LocalTime.of(1, 0);
    private static final LocalTime NIGHT_LULL_END = LocalTime.of(4, 30);

    /**
     * Maps Priority enum to numerical operational weight.
     */
    public double getPriorityWeight(Priority priority) {
        if (priority == null) return LOW_PRIORITY_WEIGHT;
        return switch (priority) {
            case HIGH -> HIGH_PRIORITY_WEIGHT;
            case MEDIUM -> MEDIUM_PRIORITY_WEIGHT;
            case LOW -> LOW_PRIORITY_WEIGHT;
        };
    }

    /**
     * Calculates the Disruption Cost Score for a candidate maintenance window:
     * DisruptionCost = Sum( TrainPriorityWeight * OverlapDurationMinutes )
     * If the window falls within the night lull period, a 50% discount bonus is applied.
     */
    public double calculateDisruptionCost(List<Schedule> conflictingSchedules, LocalDateTime slotStart, LocalDateTime slotEnd) {
        if (conflictingSchedules == null || conflictingSchedules.isEmpty()) {
            return 0.0;
        }

        double totalDisruptionCost = 0.0;

        for (Schedule schedule : conflictingSchedules) {
            Priority priority = schedule.getTrain() != null ? schedule.getTrain().getPriority() : Priority.MEDIUM;
            double weight = getPriorityWeight(priority);

            LocalDateTime overlapStart = schedule.getEntryTime().isAfter(slotStart) ? schedule.getEntryTime() : slotStart;
            LocalDateTime overlapEnd = schedule.getExitTime().isBefore(slotEnd) ? schedule.getExitTime() : slotEnd;

            long overlapMinutes = Math.max(0, Duration.between(overlapStart, overlapEnd).toMinutes());
            totalDisruptionCost += (weight * overlapMinutes);
        }

        // Apply night lull bonus (favorable operating window)
        if (isNightLullWindow(slotStart, slotEnd)) {
            totalDisruptionCost *= 0.5; // 50% penalty discount for utilizing the natural railway lull window
        }

        return Math.round(totalDisruptionCost * 10.0) / 10.0;
    }

    /**
     * Checks if a proposed block window fits predominantly inside the 01:00 AM - 04:30 AM lull window.
     */
    public boolean isNightLullWindow(LocalDateTime start, LocalDateTime end) {
        LocalTime startTime = start.toLocalTime();
        LocalTime endTime = end.toLocalTime();

        boolean startsInLull = !startTime.isBefore(NIGHT_LULL_START) && !startTime.isAfter(NIGHT_LULL_END);
        boolean endsInLull = !endTime.isBefore(NIGHT_LULL_START) && !endTime.isAfter(LocalTime.of(5, 0));

        return startsInLull || endsInLull;
    }

    /**
     * Calculates urgency score of an asset based on its current healthScore (0-100).
     * Urgency = (100 - healthScore) * RequestPriorityMultiplier
     * - Health < 70%: Warning / Maintenance Due
     * - Health < 50%: Critical / Immediate Block Required
     */
    public double calculateAssetUrgencyScore(Asset asset, Priority requestPriority) {
        if (asset == null || asset.getHealthScore() == null) {
            return 50.0;
        }

        int health = asset.getHealthScore();
        double degradationFactor = (100.0 - health); // 0 (brand new) to 100 (failed)
        double priorityMultiplier = getPriorityWeight(requestPriority);

        return Math.round((degradationFactor * priorityMultiplier) * 10.0) / 10.0;
    }
}
