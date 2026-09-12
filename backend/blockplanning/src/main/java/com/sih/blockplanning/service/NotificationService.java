package com.sih.blockplanning.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * NotificationService logs and dispatches real-time alerts for block approvals,
 * schedule conflicts, and shadow blocking opportunities.
 */
@Slf4j
@Service
public class NotificationService {

    public void notifyConflict(Long blockId, String trainNumber, String severity) {
        log.warn("🚨 [COLLISION ALERT] Block #{} has {} conflict with Train {}", blockId, severity, trainNumber);
    }

    public void notifyStatusChange(Long blockId, String newStatus, String remarks) {
        log.info("📢 [BLOCK STATUS UPDATE] Block #{} is now {}. Remarks: {}", blockId, newStatus, remarks);
    }

    public void notifyShadowBlockOpportunity(Long trackId, Long assetId, String assetName) {
        log.info("🔗 [SHADOW BLOCKING] Detected low-health asset '{}' (ID: {}) on Track #{} eligible for bundling",
                assetName, assetId, trackId);
    }
}
