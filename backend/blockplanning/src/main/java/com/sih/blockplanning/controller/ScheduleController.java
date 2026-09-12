package com.sih.blockplanning.controller;

import com.sih.blockplanning.dto.response.ApiResponse;
import com.sih.blockplanning.dto.response.ScheduleResponseDTO;
import com.sih.blockplanning.entity.Schedule;
import com.sih.blockplanning.entity.Train;
import com.sih.blockplanning.enums.Priority;
import com.sih.blockplanning.exception.ResourceNotFoundException;
import com.sih.blockplanning.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ScheduleController exposes train timetables that power the visual Gantt chart
 * and maintenance planning timeline.
 */
@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleRepository scheduleRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ScheduleResponseDTO>>> getSchedules(
            @RequestParam(required = false) Long trackId
    ) {
        List<Schedule> schedules = (trackId != null)
                ? scheduleRepository.findByTrackId(trackId)
                : scheduleRepository.findAll();

        List<ScheduleResponseDTO> dtos = schedules.stream()
                .map(this::mapToDTO)
                .toList();

        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ScheduleResponseDTO>> getScheduleById(@PathVariable Long id) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + id));
        return ResponseEntity.ok(ApiResponse.success(mapToDTO(schedule)));
    }

    private ScheduleResponseDTO mapToDTO(Schedule schedule) {
        Train train = schedule.getTrain();
        return ScheduleResponseDTO.builder()
                .id(schedule.getId())
                .trainId(train != null ? train.getId() : null)
                .trainNumber(train != null ? train.getTrainNumber() : "N/A")
                .trainName(train != null ? train.getTrainName() : "Unknown")
                .trainType(train != null ? train.getTrainType() : "EXPRESS")
                .trainPriority(train != null ? train.getPriority() : Priority.MEDIUM)
                .trackId(schedule.getTrack() != null ? schedule.getTrack().getId() : null)
                .trackSectionCode(schedule.getTrack() != null ? schedule.getTrack().getSectionCode() : "N/A")
                .entryTime(schedule.getEntryTime())
                .exitTime(schedule.getExitTime())
                .status(schedule.getStatus())
                .build();
    }
}
