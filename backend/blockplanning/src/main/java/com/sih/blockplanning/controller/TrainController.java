package com.sih.blockplanning.controller;

import com.sih.blockplanning.dto.response.ApiResponse;
import com.sih.blockplanning.dto.response.TrackResponseDTO;
import com.sih.blockplanning.dto.response.TrainResponseDTO;
import com.sih.blockplanning.entity.Track;
import com.sih.blockplanning.entity.Train;
import com.sih.blockplanning.exception.ResourceNotFoundException;
import com.sih.blockplanning.repository.TrackRepository;
import com.sih.blockplanning.repository.TrainRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * TrainController provides catalog queries for Indian Railways trains
 * and operational track sections.
 */
@RestController
@RequiredArgsConstructor
public class TrainController {

    private final TrainRepository trainRepository;
    private final TrackRepository trackRepository;

    @GetMapping("/api/trains")
    public ResponseEntity<ApiResponse<List<TrainResponseDTO>>> getAllTrains() {
        List<TrainResponseDTO> trains = trainRepository.findAll().stream()
                .map(this::mapToTrainDTO)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(trains));
    }

    @GetMapping("/api/trains/{id}")
    public ResponseEntity<ApiResponse<TrainResponseDTO>> getTrainById(@PathVariable Long id) {
        Train train = trainRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Train not found with id: " + id));
        return ResponseEntity.ok(ApiResponse.success(mapToTrainDTO(train)));
    }

    @GetMapping("/api/tracks")
    public ResponseEntity<ApiResponse<List<TrackResponseDTO>>> getAllTracks() {
        List<TrackResponseDTO> tracks = trackRepository.findAll().stream()
                .map(this::mapToTrackDTO)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(tracks));
    }

    @GetMapping("/api/tracks/{id}")
    public ResponseEntity<ApiResponse<TrackResponseDTO>> getTrackById(@PathVariable Long id) {
        Track track = trackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Track not found with id: " + id));
        return ResponseEntity.ok(ApiResponse.success(mapToTrackDTO(track)));
    }

    private TrainResponseDTO mapToTrainDTO(Train train) {
        return TrainResponseDTO.builder()
                .id(train.getId())
                .trainNumber(train.getTrainNumber())
                .trainName(train.getTrainName())
                .trainType(train.getTrainType())
                .priority(train.getPriority())
                .build();
    }

    private TrackResponseDTO mapToTrackDTO(Track track) {
        return TrackResponseDTO.builder()
                .id(track.getId())
                .sectionCode(track.getSectionCode())
                .startStation(track.getStartStation())
                .endStation(track.getEndStation())
                .lengthKm(track.getLengthKm())
                .status(track.getStatus())
                .build();
    }
}
