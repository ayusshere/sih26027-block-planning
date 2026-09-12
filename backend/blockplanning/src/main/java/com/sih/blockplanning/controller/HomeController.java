package com.sih.blockplanning.controller;

import com.sih.blockplanning.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * HomeController serves a root welcome status and API directory at "/"
 * so developers visiting http://localhost:8080 get immediate confirmation
 * of system health and available endpoints.
 */
@RestController
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<ApiResponse<Map<String, Object>>> rootInfo() {
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("project", "🚆 Indian Railways AI-Powered Block Planning System");
        info.put("problemStatement", "SIH26027 — Ministry of Railways");
        info.put("corridor", "Delhi Jn (DLI / NDLS) ↔ Sahibabad Jn (SBB) ↔ Ghaziabad Jn (GZB) Quadruple Trunk Corridor");
        info.put("status", "ONLINE");
        info.put("docs", "Refer to frontend/FRONTEND_GUIDE.md for frontend integration");

        Map<String, String> endpoints = new LinkedHashMap<>();
        endpoints.put("blocks", "/api/blocks");
        endpoints.put("corridorPlan", "/api/blocks/corridor-plan");
        endpoints.put("trains", "/api/trains");
        endpoints.put("tracks", "/api/tracks");
        endpoints.put("schedules", "/api/schedules");
        endpoints.put("assets", "/api/assets");
        endpoints.put("healthAlerts", "/api/assets/health-alerts");
        endpoints.put("kpiSummary", "/api/reports/kpi-summary");
        endpoints.put("availabilityReport", "/api/reports/asset-availability");
        endpoints.put("authLogin", "/api/auth/login");

        info.put("availableEndpoints", endpoints);

        return ResponseEntity.ok(ApiResponse.success("Indian Railways SIH26027 Backend is running smoothly", info));
    }
}
