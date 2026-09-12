package com.sih.blockplanning.entity;

import com.sih.blockplanning.enums.AssetType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "assets")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Asset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String assetName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetType assetType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private com.sih.blockplanning.enums.Department department = com.sih.blockplanning.enums.Department.ENGINEERING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "track_id",nullable = false)
    private Track track;

    private Integer healthScore; // 0-100(urgency scoring)

    private LocalDate lastMaintenanceDate;
    private LocalDate nextDueMaintenanceDate;
}
