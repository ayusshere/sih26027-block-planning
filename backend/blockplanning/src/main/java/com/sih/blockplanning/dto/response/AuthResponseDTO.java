package com.sih.blockplanning.dto.response;

import com.sih.blockplanning.enums.Department;
import com.sih.blockplanning.enums.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponseDTO {
    private String token;
    private String jwtToken; // Alias for frontend compatibility
    @Builder.Default
    private String tokenType = "Bearer";
    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private Role role;
    private String designation;
    private String stationAssigned;
    private Department department;
}
