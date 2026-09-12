package com.sih.blockplanning.entity;

import com.sih.blockplanning.enums.Priority;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "trains")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Train {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String trainNumber; // e.g. "12004"

    @Column(nullable = false)
    private String trainName; // e.g. "Lucknow Swarna Shatabdi"

    @Column(nullable = false)
    private String trainType; // "VANDE_BHARAT", "RAJDHANI", "EXPRESS", "FREIGHT"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority; // HIGH (Vande Bharat/Rajdhani), MEDIUM (Mail/Express), LOW (Freight)
}
