package com.sih.blockplanning.service;

import com.sih.blockplanning.algorithm.ConflictResolver;
import com.sih.blockplanning.dto.response.ConflictDetailDTO;
import com.sih.blockplanning.entity.BlockRequest;
import com.sih.blockplanning.repository.BlockRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ConflictDetectionService manages timetable collision detection and prevents
 * double-booking of track maintenance windows.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ConflictDetectionService {

    private final ConflictResolver conflictResolver;
    private final BlockRequestRepository blockRequestRepository;

    /**
     * Detects train timetable collisions within the buffered maintenance window.
     */
    public List<ConflictDetailDTO> checkConflicts(Long trackId, LocalDateTime startTime, LocalDateTime endTime) {
        return conflictResolver.detectConflicts(trackId, startTime, endTime);
    }

    /**
     * Checks if another APPROVED block is already scheduled on this track during the proposed window.
     */
    public boolean hasApprovedBlockOverlap(Long trackId, LocalDateTime startTime, LocalDateTime endTime) {
        List<BlockRequest> approvedBlocks = blockRequestRepository
                .findOverlappingApprovedBlocks(trackId, startTime, endTime);
        return !approvedBlocks.isEmpty();
    }

    /**
     * Checks if any detected conflict is critical (Vande Bharat / Rajdhani Express).
     */
    public boolean hasCriticalTrainOverlap(List<ConflictDetailDTO> conflicts) {
        return conflictResolver.hasCriticalConflict(conflicts);
    }
}
