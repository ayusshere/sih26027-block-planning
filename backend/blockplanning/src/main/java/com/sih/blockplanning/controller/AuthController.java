package com.sih.blockplanning.controller;

import com.sih.blockplanning.dto.request.LoginRequestDTO;
import com.sih.blockplanning.dto.response.ApiResponse;
import com.sih.blockplanning.dto.response.AuthResponseDTO;
import com.sih.blockplanning.entity.User;
import com.sih.blockplanning.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AuthController handles authentication requests and session queries for Station Masters
 * and Maintenance Engineers.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> login(@Valid @RequestBody LoginRequestDTO request) {
        AuthResponseDTO response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> getCurrentUser(@RequestParam Long userId) {
        User user = authService.getUserById(userId);
        AuthResponseDTO response = AuthResponseDTO.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .designation(user.getDesignation())
                .stationAssigned(user.getStationAssigned())
                .build();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
