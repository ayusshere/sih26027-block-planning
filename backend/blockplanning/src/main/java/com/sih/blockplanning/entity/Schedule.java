package com.sih.blockplanning.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "schedules")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "train_id", nullable = false)
    private Train train;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "track_id", nullable = false)
    private Track track;

    @Column(nullable = false)
    private LocalDateTime entryTime; // Time train enters the track section

    @Column(nullable = false)
    private LocalDateTime exitTime; // Time train leaves the track section

    @Builder.Default
    private String status = "SCHEDULED"; // "SCHEDULED", "DELAYED", "DIVERTED", "CANCELLED"
}