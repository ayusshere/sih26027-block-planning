package com.sih.blockplanning.entity;

import com.sih.blockplanning.enums.BlockStatus;
import com.sih.blockplanning.enums.Priority;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "block_requests")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BlockRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title; // e.g. "OHE Tensioning & Track Tamping"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private com.sih.blockplanning.enums.Department department = com.sih.blockplanning.enums.Department.ENGINEERING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "track_id", nullable = false)
    private Track track;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id")
    private Asset asset;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by_user_id", nullable = false)
    private User requestedBy;

    @Column(nullable = false)
    private LocalDateTime requestedStartTime;

    @Column(nullable = false)
    private LocalDateTime requestedEndTime;

    private LocalDateTime allocatedStartTime; // Set by AI Optimizer

    private LocalDateTime allocatedEndTime;   // Set by AI Optimizer

    private String purpose;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BlockStatus status = BlockStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    @Column(length = 1000)
    private String conflictRemarks; // Details if any train conflicts were resolved/detected
}
