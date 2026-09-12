package com.sih.blockplanning.entity;

import com.sih.blockplanning.enums.Role;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Column(unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String designation; // e.g. "Chief Controller", "Senior Section Engineer"

    private String stationAssigned; // e.g. "NDLS", "GZB"

    @Enumerated(EnumType.STRING)
    private com.sih.blockplanning.enums.Department department;
}
