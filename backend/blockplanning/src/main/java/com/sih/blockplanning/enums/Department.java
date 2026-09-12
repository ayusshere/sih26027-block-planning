package com.sih.blockplanning.enums;

/**
 * Department represents the specialized functional branches of Indian Railways
 * responsible for track maintenance, signaling, electrical power, and operations.
 */
public enum Department {
    ENGINEERING,       // Civil / Track / P-Way (Permanent Way) / Bridges
    SIGNAL_TELECOM,    // S&T (Signals, Interlocking, Point Machines, Axle Counters)
    ELECTRICAL,        // TRD / OHE (Traction Distribution, 25kV Catenary, Power Blocks)
    OPERATIONS         // Section Controllers, Station Masters, Traffic Movement
}
