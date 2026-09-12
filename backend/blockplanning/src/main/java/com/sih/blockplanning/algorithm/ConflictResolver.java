package com.sih.blockplanning.algorithm;

import com.sih.blockplanning.dto.response.ConflictDetailDTO;
import com.sih.blockplanning.entity.Schedule;
import com.sih.blockplanning.entity.Train;
import com.sih.blockplanning.enums.Priority;
import com.sih.blockplanning.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * ConflictResolver detects spatial and temporal collisions between requested
 * maintenance blocks and scheduled train timetables.
 * Enforces a mandatory 15-minute safety headway buffer before block entry
 * and after block clearance.
 */
@Component
@RequiredArgsConstructor
public class ConflictResolver {

    public static final int SAFETY_HEADWAY_BUFFER_MINUTES = 15;

    private final ScheduleRepository scheduleRepository;

    /**
     * Identifies train schedule conflicts on a track section for a given time window,
     * applying safety buffer margins before start and after release.
     */
    public List<ConflictDetailDTO> detectConflicts(Long trackId, LocalDateTime startTime, LocalDateTime endTime) {
        LocalDateTime bufferedStartTime = startTime.minusMinutes(SAFETY_HEADWAY_BUFFER_MINUTES);
        LocalDateTime bufferedEndTime = endTime.plusMinutes(SAFETY_HEADWAY_BUFFER_MINUTES);

        List<Schedule> rawConflicts = scheduleRepository.findConflictingSchedules(trackId, bufferedStartTime, bufferedEndTime);
        List<ConflictDetailDTO> conflictDetails = new ArrayList<>();

        for (Schedule schedule : rawConflicts) {
            Train train = schedule.getTrain();
            Priority trainPriority = (train != null && train.getPriority() != null) ? train.getPriority() : Priority.MEDIUM;

            LocalDateTime overlapStart = schedule.getEntryTime().isAfter(startTime) ? schedule.getEntryTime() : startTime;
            LocalDateTime overlapEnd = schedule.getExitTime().isBefore(endTime) ? schedule.getExitTime() : endTime;

            long overlapMinutes = Math.max(0, Duration.between(overlapStart, overlapEnd).toMinutes());

            // If overlap falls within the 15-minute buffer zone, record minimal buffer warning
            if (overlapMinutes == 0) {
                overlapMinutes = SAFETY_HEADWAY_BUFFER_MINUTES;
            }

            String severity = classifySeverity(trainPriority);

            conflictDetails.add(ConflictDetailDTO.builder()
                    .scheduleId(schedule.getId())
                    .trainNumber(train != null ? train.getTrainNumber() : "N/A")
                    .trainName(train != null ? train.getTrainName() : "Unknown Train")
                    .trainType(train != null ? train.getTrainType() : "EXPRESS")
                    .trainPriority(trainPriority)
                    .entryTime(schedule.getEntryTime())
                    .exitTime(schedule.getExitTime())
                    .overlapDurationMinutes(overlapMinutes)
                    .severity(severity)
                    .build());
        }

        return conflictDetails;
    }

    /**
     * Returns raw JPA Schedule entities conflicting with the buffered time window.
     */
    public List<Schedule> findRawConflictingSchedules(Long trackId, LocalDateTime startTime, LocalDateTime endTime) {
        LocalDateTime bufferedStartTime = startTime.minusMinutes(SAFETY_HEADWAY_BUFFER_MINUTES);
        LocalDateTime bufferedEndTime = endTime.plusMinutes(SAFETY_HEADWAY_BUFFER_MINUTES);
        return scheduleRepository.findConflictingSchedules(trackId, bufferedStartTime, bufferedEndTime);
    }

    /**
     * Evaluates whether any detected conflict involves a high-priority train (Vande Bharat / Rajdhani).
     */
    public boolean hasCriticalConflict(List<ConflictDetailDTO> conflicts) {
        if (conflicts == null) return false;
        return conflicts.stream().anyMatch(c -> "CRITICAL".equalsIgnoreCase(c.getSeverity()));
    }

    private String classifySeverity(Priority priority) {
        return switch (priority) {
            case HIGH -> "CRITICAL";  // Direct clash with Vande Bharat / Rajdhani
            case MEDIUM -> "MODERATE"; // Mail / Express train
            case LOW -> "LOW";         // Freight / Empty Rake
        };
    }
}
