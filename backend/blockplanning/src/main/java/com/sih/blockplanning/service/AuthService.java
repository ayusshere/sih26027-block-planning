package com.sih.blockplanning.service;

import com.sih.blockplanning.dto.request.LoginRequestDTO;
import com.sih.blockplanning.dto.response.AuthResponseDTO;
import com.sih.blockplanning.entity.User;
import com.sih.blockplanning.exception.ResourceNotFoundException;
import com.sih.blockplanning.repository.UserRepository;
import com.sih.blockplanning.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * AuthService handles authentication, user credential verification,
 * and JWT bearer token issuance.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /**
     * Authenticates user and returns JWT token with role & station context.
     */
    public AuthResponseDTO login(LoginRequestDTO request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        boolean matches = passwordEncoder.matches(request.getPassword(), user.getPassword())
                || request.getPassword().equals(user.getPassword());

        if (!matches) {
            throw new BadCredentialsException("Invalid username or password");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

        return AuthResponseDTO.builder()
                .token(token)
                .jwtToken(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .department(user.getDepartment())
                .email(user.getEmail())
                .role(user.getRole())
                .designation(user.getDesignation())
                .stationAssigned(user.getStationAssigned())
                .build();
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }
}
