package com.sih.blockplanning.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tracks")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Track {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String sectionCode; // e.g. "SEC-NDLS-GZB-01"

    @Column(nullable = false)
    private String startStation; // e.g. "NDLS"

    @Column(nullable = false)
    private String endStation; // e.g. "GZB"

    private Double lengthKm;

    @Column(nullable = false)
    @Builder.Default
    private String status = "OPERATIONAL"; // "OPERATIONAL", "BLOCKED", "MAINTENANCE"
}