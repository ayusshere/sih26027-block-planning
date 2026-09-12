package com.sih.blockplanning.controller;

import com.sih.blockplanning.dto.request.BlockRequestDTO;
import com.sih.blockplanning.dto.response.ApiResponse;
import com.sih.blockplanning.dto.response.BlockResponseDTO;
import com.sih.blockplanning.dto.response.ConflictDetailDTO;
import com.sih.blockplanning.dto.response.SlotRecommendationDTO;
import com.sih.blockplanning.enums.BlockStatus;
import com.sih.blockplanning.service.BlockPlanningService;
import com.sih.blockplanning.service.ConflictDetectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * BlockController exposes REST endpoints for traffic maintenance blocks,
 * collision detection, approvals, rejections, and AI optimization recommendations.
 */
@RestController
@RequestMapping("/api/blocks")
@RequiredArgsConstructor
public class BlockController {

    private final BlockPlanningService blockPlanningService;
    private final ConflictDetectionService conflictDetectionService;

    /**
     * Submit a new maintenance block request.
     * Automatically triggers conflict detection and AI optimizer if conflicts exist.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<BlockResponseDTO>> createBlock(@Valid @RequestBody BlockRequestDTO requestDTO) {
        BlockResponseDTO response = blockPlanningService.createBlockRequest(requestDTO);
        String message = response.isHasConflict()
                ? "Block submitted. Train collisions detected; alternative slots recommended."
                : "Block request submitted successfully. Zero train conflict.";
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(message, response));
    }

    /**
     * Retrieve all blocks, optionally filtered by status or track.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<BlockResponseDTO>>> getBlocks(
            @RequestParam(required = false) BlockStatus status,
            @RequestParam(required = false) Long trackId
    ) {
        List<BlockResponseDTO> blocks;
        if (status != null) {
            blocks = blockPlanningService.getBlocksByStatus(status);
        } else if (trackId != null) {
            blocks = blockPlanningService.getBlocksByTrack(trackId);
        } else {
            blocks = blockPlanningService.getAllBlocks();
        }
        return ResponseEntity.ok(ApiResponse.success(blocks));
    }

    /**
     * Retrieve full details of a specific block by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BlockResponseDTO>> getBlockById(@PathVariable Long id) {
        BlockResponseDTO block = blockPlanningService.getBlockById(id);
        return ResponseEntity.ok(ApiResponse.success(block));
    }

    /**
     * Approve a block and lock its allocated window.
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<BlockResponseDTO>> approveBlock(
            @PathVariable Long id,
            @RequestBody(required = false) ApprovalRequest body
    ) {
        LocalDateTime start = (body != null) ? body.allocatedStartTime() : null;
        LocalDateTime end = (body != null) ? body.allocatedEndTime() : null;
        BlockResponseDTO approved = blockPlanningService.approveBlock(id, start, end);
        return ResponseEntity.ok(ApiResponse.success("Block approved and locked for maintenance", approved));
    }

    /**
     * Reject a block request with operational remarks.
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<BlockResponseDTO>> rejectBlock(
            @PathVariable Long id,
            @RequestBody(required = false) RejectionRequest body
    ) {
        String reason = (body != null && body.reason() != null) ? body.reason() : "Rejected by Section Controller";
        BlockResponseDTO rejected = blockPlanningService.rejectBlock(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Block request rejected", rejected));
    }

    /**
     * On-demand AI Optimizer recommendations for a block.
     */
    @GetMapping("/{id}/recommendations")
    public ResponseEntity<ApiResponse<List<SlotRecommendationDTO>>> getRecommendations(@PathVariable Long id) {
        List<SlotRecommendationDTO> recommendations = blockPlanningService.getRecommendations(id);
        return ResponseEntity.ok(ApiResponse.success("Top AI recommended conflict-free windows", recommendations));
    }

    /**
     * Pre-check conflicts for an arbitrary proposed window without saving a block.
     */
    @GetMapping("/conflicts/check")
    public ResponseEntity<ApiResponse<List<ConflictDetailDTO>>> checkConflicts(
            @RequestParam Long trackId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime
    ) {
        List<ConflictDetailDTO> conflicts = conflictDetectionService.checkConflicts(trackId, startTime, endTime);
        return ResponseEntity.ok(ApiResponse.success(conflicts));
    }

    /**
     * SIH Master Feature: Corridor Batch Optimization & Integrated Mega-Block Report.
     * Evaluates all departmental maintenance requests, bundles multi-department works,
     * resolves all collisions, and computes overall passenger delay savings.
     */
    @GetMapping("/corridor-plan")
    public ResponseEntity<ApiResponse<com.sih.blockplanning.dto.response.CorridorOptimizationPlanDTO>> getCorridorPlan() {
        com.sih.blockplanning.dto.response.CorridorOptimizationPlanDTO plan = blockPlanningService.generateCorridorOptimizationPlan();
        return ResponseEntity.ok(ApiResponse.success("Corridor Optimization & Integrated Mega-Block Plan generated", plan));
    }

    public record ApprovalRequest(LocalDateTime allocatedStartTime, LocalDateTime allocatedEndTime) {}
    public record RejectionRequest(String reason) {}
}
