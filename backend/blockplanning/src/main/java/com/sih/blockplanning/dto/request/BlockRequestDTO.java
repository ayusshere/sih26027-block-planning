package com.sih.blockplanning.dto.request;

import com.sih.blockplanning.enums.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlockRequestDTO {

    @NotBlank(message = "Title is required (e.g. OHE Tensioning, Track Tamping)")
    private String title;

    @NotNull(message = "Track ID is required")
    private Long trackId;

    private com.sih.blockplanning.enums.Department department;

    private Long assetId; // Optional: specific asset undergoing maintenance

    @NotNull(message = "Requested by user ID is required")
    private Long requestedByUserId;

    @NotNull(message = "Requested start time is required")
    private LocalDateTime requestedStartTime;

    @NotNull(message = "Requested end time is required")
    private LocalDateTime requestedEndTime;

    private String purpose;

    @NotNull(message = "Priority is required")
    private Priority priority;

    @Builder.Default
    private Boolean autoOptimize = false; // If true, AI optimizer will automatically find optimal slot if conflicts exist
}
