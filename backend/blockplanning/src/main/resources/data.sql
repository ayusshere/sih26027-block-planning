-- ====================================================================
-- Indian Railways SIH26027 — Official Master Dataset
-- Corridor: Delhi Junction (DLI / NDLS) ↔ Sahibabad (SBB) ↔ Ghaziabad (GZB)
-- Division: Delhi Division, Northern Railway (NR)
-- Network: Quadruple Line Trunk (Line 1 UP, Line 2 DN, Line 3 Reversible, Line 4 EMU)
--          plus Historic Yamuna Bridge, Sahibabad Loop, and Ghaziabad Yard
-- Departments: ENGINEERING (Civil/P-Way), SIGNAL_TELECOM (S&T), ELECTRICAL (TRD/OHE)
-- ====================================================================

-- 0. Clean old records to ensure clean corridor setup
DELETE FROM block_requests;
DELETE FROM schedules;
DELETE FROM assets;
DELETE FROM trains;
DELETE FROM tracks;
DELETE FROM users;

-- 1. Real System Users (Controllers, Station Masters & Departmental Engineers)
INSERT INTO users (id, username, password, full_name, email, role, designation, department, station_assigned)
VALUES 
    (1, 'delhi_controller', 'password123', 'Rajesh Sharma', 'controller.delhi@nr.railnet.gov.in', 'STATION_MASTER', 'Chief Section Controller (Delhi - Ghaziabad)', 'OPERATIONS', 'NDLS'),
    (2, 'pway_engineer_civil', 'password123', 'Vikram Malhotra', 'sse.pway.sbb@nr.railnet.gov.in', 'MAINTENANCE_ENGINEER', 'Senior Section Engineer (P-Way / Track & Bridge)', 'ENGINEERING', 'SBB'),
    (3, 'snt_engineer_delhi', 'password123', 'Amitabh Saxena', 'sse.snt.gzb@nr.railnet.gov.in', 'MAINTENANCE_ENGINEER', 'Senior Section Engineer (Signal & Telecom)', 'SIGNAL_TELECOM', 'GZB'),
    (4, 'trd_engineer_ohe', 'password123', 'Sunil Deshmukh', 'sse.trd.delhi@nr.railnet.gov.in', 'MAINTENANCE_ENGINEER', 'Senior Section Engineer (TRD / 25kV OHE)', 'ELECTRICAL', 'ANVT'),
    (5, 'drm_delhi', 'admin123', 'Divisional Railway Manager', 'drm@delhi.railnet.gov.in', 'ADMIN', 'DRM Delhi Division', 'OPERATIONS', 'NDLS')
ON CONFLICT (id) DO UPDATE SET 
    username = EXCLUDED.username,
    password = EXCLUDED.password,
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    designation = EXCLUDED.designation,
    department = EXCLUDED.department,
    station_assigned = EXCLUDED.station_assigned;

-- 2. Schematic Operational Railway Track Sections (Delhi ↔ Ghaziabad Trunk)
INSERT INTO tracks (id, section_code, start_station, end_station, length_km, status)
VALUES 
    -- Section 1: Delhi to Ghaziabad UP Main Line 1 (Express & Superfast Corridor)
    (1, 'SEC-NDLS-GZB-LINE1', 'NDLS', 'GZB', 28.0, 'OPERATIONAL'),
    -- Section 2: Ghaziabad to Delhi DOWN Main Line 2 (Heavy Mixed Traffic)
    (2, 'SEC-GZB-NDLS-LINE2', 'GZB', 'NDLS', 28.0, 'OPERATIONAL'),
    -- Section 3: Delhi to Ghaziabad 3rd Reversible Freight / Suburban Line
    (3, 'SEC-NDLS-GZB-LINE3', 'NDLS', 'GZB', 28.0, 'OPERATIONAL'),
    -- Section 4: Delhi to Ghaziabad 4th Line (Dedicated EMU Commuter Local)
    (4, 'SEC-NDLS-GZB-LINE4', 'NDLS', 'GZB', 28.0, 'OPERATIONAL'),
    -- Section 5: Old Delhi to Sahibabad UP via Historic Yamuna Bridge (Loha Pul)
    (5, 'SEC-DLI-SBB-YAMUNA-UP', 'DLI', 'SBB', 11.2, 'OPERATIONAL'),
    -- Section 6: Sahibabad to Old Delhi DN via Historic Yamuna Bridge (Loha Pul)
    (6, 'SEC-SBB-DLI-YAMUNA-DN', 'SBB', 'DLI', 11.2, 'OPERATIONAL'),
    -- Section 7: Sahibabad to Ghaziabad Quadruple UP Link
    (7, 'SEC-SBB-GZB-UP', 'SBB', 'GZB', 6.8, 'OPERATIONAL'),
    -- Section 8: Ghaziabad to Sahibabad Quadruple DN Link
    (8, 'SEC-GZB-SBB-DN', 'GZB', 'SBB', 6.8, 'OPERATIONAL'),
    -- Section 9: Tilak Bridge to Anand Vihar Main UP Section
    (9, 'SEC-TKJ-ANVT-UP', 'TKJ', 'ANVT', 8.4, 'OPERATIONAL'),
    -- Section 10: Anand Vihar to Tilak Bridge Main DN Section
    (10, 'SEC-ANVT-TKJ-DN', 'ANVT', 'TKJ', 8.4, 'OPERATIONAL'),
    -- Section 11: Sahibabad Junction Station Loop Line (Express Overtakes)
    (11, 'SEC-SBB-LOOP-OVERTAKE', 'SBB', 'SBB', 1.5, 'OPERATIONAL'),
    -- Section 12: Ghaziabad EMU Car Shed Stabling Track
    (12, 'SEC-GZB-YD-EMUSHED', 'GZB', 'GZB', 2.5, 'OPERATIONAL'),
    -- Section 13: Ghaziabad Marshalling Freight Sorting Yard
    (13, 'SEC-GZB-YD-FREIGHT', 'GZB', 'GZB', 3.2, 'OPERATIONAL'),
    -- Section 14: Anand Vihar Terminal Coaching Yard Neck
    (14, 'SEC-ANVT-COACH-YD', 'ANVT', 'ANVT', 1.8, 'OPERATIONAL'),
    -- Section 15: Tilak Bridge Rail-over-Rail Flyover Section
    (15, 'SEC-TKJ-FLYOVER', 'NDLS', 'TKJ', 2.6, 'OPERATIONAL'),
    -- Section 16: Hindon River Major Rail Bridge Section
    (16, 'SEC-HINDON-BRIDGE', 'SBB', 'GZB', 2.1, 'OPERATIONAL')
ON CONFLICT (id) DO UPDATE SET 
    section_code = EXCLUDED.section_code,
    start_station = EXCLUDED.start_station,
    end_station = EXCLUDED.end_station,
    length_km = EXCLUDED.length_km,
    status = EXCLUDED.status;

-- 3. Multi-Departmental Infrastructure Assets
-- Note: Track 2 hosts 4 degraded assets (< 70%) across Civil, S&T, and Electrical,
-- perfectly demonstrating SIH's Integrated Corridor Mega-Block / Cross-Departmental Shadow Blocking!
INSERT INTO assets (id, asset_name, asset_type, department, track_id, health_score, last_maintenance_date, next_due_maintenance_date)
VALUES 
    -- Civil / Engineering Department
    (1, 'Historic Yamuna Bridge BR-01 Steel Girder (KM 4.2 Loha Pul)', 'BRIDGE', 'ENGINEERING', 5, 68, '2026-05-10', '2026-09-12'),
    (2, 'Hindon River Prestressed Concrete Rail Bridge BR-02 (KM 18.6)', 'BRIDGE', 'ENGINEERING', 16, 91, '2026-07-20', '2026-11-20'),
    (3, 'Heavy Duty Continuous Welded Rail CWR KM 14-17 (Line 2 Down)', 'TRACK', 'ENGINEERING', 2, 62, '2026-06-15', '2026-09-10'),
    (4, 'Turnout 1-in-12 Heavy Curved Switch (Sahibabad Loop Entry)', 'TRACK', 'ENGINEERING', 11, 76, '2026-07-02', '2026-10-02'),
    (5, 'Tilak Bridge Crossover Diamond Crossing (KM 2.4)', 'TRACK', 'ENGINEERING', 15, 85, '2026-08-01', '2026-11-01'),

    -- Signal & Telecommunication (S&T) Department
    (6, 'Multi-Aspect Color Light Home Signal S-14 (Sahibabad Entry)', 'SIGNALING', 'SIGNAL_TELECOM', 2, 56, '2026-05-25', '2026-09-08'),
    (7, 'Down Advance Starter Signal S-22 (Ghaziabad Exit)', 'SIGNALING', 'SIGNAL_TELECOM', 2, 88, '2026-07-18', '2026-10-18'),
    (8, 'Point Machine PM-102 (Ghaziabad Central Crossover Motor)', 'POINT_MACHINE', 'SIGNAL_TELECOM', 2, 59, '2026-06-05', '2026-09-09'),
    (9, 'Point Machine PM-108 (Sahibabad Junction Main-to-Loop)', 'POINT_MACHINE', 'SIGNAL_TELECOM', 11, 84, '2026-07-12', '2026-10-12'),
    (10, 'Solid State Electronic Interlocking EI-GZB (Central Cabin)', 'SIGNALING', 'SIGNAL_TELECOM', 1, 95, '2026-08-10', '2026-12-10'),
    (11, 'Digital Axle Counter DAC-04 (Tilak Bridge - Anand Vihar)', 'SIGNALING', 'SIGNAL_TELECOM', 9, 66, '2026-06-20', '2026-09-15'),
    (12, 'Audio Frequency Track Circuit AFTC-11 (Yamuna Bridge Approach)', 'SIGNALING', 'SIGNAL_TELECOM', 5, 74, '2026-07-08', '2026-10-08'),

    -- Electrical (TRD / 25kV OHE) Department
    (13, '25kV AC Catenary Contact Wire (SBB - GZB Line 2 KM 12-16)', 'OHE', 'ELECTRICAL', 2, 61, '2026-06-01', '2026-09-09'),
    (14, 'Traction Substation Feeder Circuit Breaker CB-09 (Sahibabad TSS)', 'OHE', 'ELECTRICAL', 1, 92, '2026-08-05', '2026-11-05'),
    (15, 'Neutral Section Assembly NS-03 (Tilak Bridge)', 'OHE', 'ELECTRICAL', 9, 87, '2026-07-25', '2026-10-25'),
    (16, 'OHE Automatic Tensioning Device ATD-21 (Ghaziabad Yard Approach)', 'OHE', 'ELECTRICAL', 12, 54, '2026-05-30', '2026-09-07')
ON CONFLICT (id) DO UPDATE SET 
    asset_name = EXCLUDED.asset_name,
    asset_type = EXCLUDED.asset_type,
    department = EXCLUDED.department,
    track_id = EXCLUDED.track_id,
    health_score = EXCLUDED.health_score,
    last_maintenance_date = EXCLUDED.last_maintenance_date,
    next_due_maintenance_date = EXCLUDED.next_due_maintenance_date;

-- 4. Authentic Indian Railways Trains Operating on Delhi - Ghaziabad Corridor
INSERT INTO trains (id, train_number, train_name, train_type, priority)
VALUES 
    (1, '22436', 'Vande Bharat Express (New Delhi - Varanasi)', 'VANDE_BHARAT', 'HIGH'),
    (2, '12004', 'Lucknow Swarna Shatabdi Express', 'SHATABDI', 'HIGH'),
    (3, '12424', 'New Delhi - Dibrugarh Rajdhani Express', 'RAJDHANI', 'HIGH'),
    (4, '12015', 'New Delhi - Daurai (Ajmer) Shatabdi Express', 'SHATABDI', 'HIGH'),
    (5, '12401', 'Islampur - New Delhi Magadh Express', 'EXPRESS', 'HIGH'),
    (6, '12420', 'New Delhi - Lucknow Gomti Express', 'EXPRESS', 'MEDIUM'),
    (7, '14042', 'Dehradun - Delhi Sarai Rohilla Mussoorie Express', 'EXPRESS', 'MEDIUM'),
    (8, '12226', 'Delhi - Azamgarh Kaifiyat Express', 'EXPRESS', 'HIGH'),
    (9, '64424', 'Ghaziabad - New Delhi Peak Office Commuter EMU', 'SUBURBAN', 'HIGH'),
    (10, '64437', 'New Delhi - Ghaziabad Peak Evening Office EMU', 'SUBURBAN', 'HIGH'),
    (11, '64411', 'Ghaziabad - Old Delhi Morning EMU Local', 'SUBURBAN', 'MEDIUM'),
    (12, 'CONCOR-7012', 'Tughlakabad - Dadri Freight Container Express', 'FREIGHT', 'LOW')
ON CONFLICT (id) DO UPDATE SET 
    train_number = EXCLUDED.train_number,
    train_name = EXCLUDED.train_name,
    train_type = EXCLUDED.train_type,
    priority = EXCLUDED.priority;

-- 5. Realistic Train Timetables on Corridor Tracks (Sept 8, 2026)
INSERT INTO schedules (id, train_id, track_id, entry_time, exit_time, status)
VALUES 
    -- 22436 Vande Bharat morning sprint on Line 1 UP (Delhi to Ghaziabad)
    (1, 1, 1, '2026-09-08 06:00:00', '2026-09-08 06:35:00', 'ON_TIME'),
    -- 12004 Lucknow Swarna Shatabdi on Line 1 UP
    (2, 2, 1, '2026-09-08 06:10:00', '2026-09-08 06:45:00', 'ON_TIME'),
    -- 64424 Peak Morning Office EMU Local on Line 4 (Ghaziabad to Delhi)
    (3, 9, 4, '2026-09-08 08:15:00', '2026-09-08 09:10:00', 'ON_TIME'),
    -- 12420 Gomti Express on Line 1 UP
    (4, 6, 1, '2026-09-08 12:20:00', '2026-09-08 13:00:00', 'ON_TIME'),
    -- CONCOR Container Freight on Line 3 Reversible
    (5, 12, 3, '2026-09-08 13:00:00', '2026-09-08 14:30:00', 'ON_TIME'),
    -- 12401 Magadh Express on Line 2 DN (Crucial collision target: 14:10–14:45)
    (6, 5, 2, '2026-09-08 14:10:00', '2026-09-08 14:45:00', 'ON_TIME'),
    -- 12015 Ajmer Shatabdi on Line 2 DN (Crucial collision target: 16:15–16:50)
    (7, 4, 2, '2026-09-08 16:15:00', '2026-09-08 16:50:00', 'ON_TIME'),
    -- 12424 Dibrugarh Rajdhani Express on Line 1 UP
    (8, 3, 1, '2026-09-08 16:20:00', '2026-09-08 16:55:00', 'ON_TIME'),
    -- 64437 Peak Evening Office EMU on Line 4 (Delhi to Ghaziabad)
    (9, 10, 4, '2026-09-08 17:30:00', '2026-09-08 18:25:00', 'ON_TIME'),
    -- 14042 Mussoorie Express crossing Historic Yamuna Bridge UP
    (10, 7, 5, '2026-09-08 07:20:00', '2026-09-08 08:05:00', 'ON_TIME'),
    -- 64411 Morning EMU Local crossing Yamuna Bridge UP
    (11, 11, 5, '2026-09-08 06:45:00', '2026-09-08 07:35:00', 'ON_TIME'),
    -- 12226 Kaifiyat Express night departure on Line 1 UP
    (12, 8, 1, '2026-09-08 20:25:00', '2026-09-08 21:05:00', 'ON_TIME')
ON CONFLICT (id) DO UPDATE SET 
    train_id = EXCLUDED.train_id,
    track_id = EXCLUDED.track_id,
    entry_time = EXCLUDED.entry_time,
    exit_time = EXCLUDED.exit_time,
    status = EXCLUDED.status;

-- 6. Pre-Seeded Maintenance Block Requests (20 Realistic Multi-Departmental Requests)
-- Intentionally designed to recreate the user's winning hackathon story:
-- Requests on Line 2 clash directly with Magadh & Shatabdi (14:00 - 18:30) and overlap
-- across Engineering, S&T, and Electrical, prompting the AI Optimizer to synthesize
-- a unified "Integrated Mega-Block" during the 01:30–04:30 AM Night Lull!
INSERT INTO block_requests (id, title, department, track_id, asset_id, requested_by_user_id, requested_start_time, requested_end_time, allocated_start_time, allocated_end_time, purpose, priority, status, conflict_remarks)
VALUES 
    -- Request 1: Engineering requesting Track 2 during afternoon rush
    (1, 'Heavy Track Tamping & Ballast Regulation KM 14-17', 'ENGINEERING', 2, 3, 2, '2026-09-08 14:00:00', '2026-09-08 17:00:00', NULL, NULL, 'Routine post-monsoon track stabilization', 'HIGH', 'PENDING', 'Clashes with Magadh 12401 & Shatabdi 12015'),
    -- Request 2: S&T requesting Signal S-14 on Track 2 at same time
    (2, 'Color Light Signal S-14 Relay & Aspect Overhaul', 'SIGNAL_TELECOM', 2, 6, 3, '2026-09-08 15:00:00', '2026-09-08 16:00:00', NULL, NULL, 'Critical signal safety maintenance', 'HIGH', 'PENDING', 'Overlaps with Civil tamping request #1'),
    -- Request 3: Electrical requesting OHE Power Block on Track 2
    (3, '25kV Catenary Wire Height Re-tensioning & Dropper Fix', 'ELECTRICAL', 2, 13, 4, '2026-09-08 16:00:00', '2026-09-08 18:30:00', NULL, NULL, 'OHE thermal expansion adjustment', 'MEDIUM', 'PENDING', 'Clashes with Shatabdi 12015; Overlaps with Civil & S&T'),
    -- Request 4: S&T requesting Point Machine PM-102 on Track 2
    (4, 'Point Machine PM-102 Motor & Lock Bar Overhaul', 'SIGNAL_TELECOM', 2, 8, 3, '2026-09-08 14:30:00', '2026-09-08 16:30:00', NULL, NULL, 'Critical switch motor overhaul', 'HIGH', 'PENDING', 'Clashes with Magadh 12401; Overlaps with Civil & Electrical'),
    
    -- Request 5: Engineering on Yamuna Bridge
    (5, 'Yamuna Steel Bridge BR-01 Girder Ultrasonic Flaw Testing', 'ENGINEERING', 5, 1, 2, '2026-09-08 07:00:00', '2026-09-08 09:00:00', NULL, NULL, 'Safety inspection of historic bridge', 'HIGH', 'PENDING', 'Clashes with Mussoorie 14042 & EMU 64411'),
    -- Request 6: S&T on Yamuna Bridge Track Circuit
    (6, 'Audio Frequency Track Circuit AFTC-11 Tuning', 'SIGNAL_TELECOM', 5, 12, 3, '2026-09-08 07:30:00', '2026-09-08 08:30:00', NULL, NULL, 'Track circuit signal frequency calibration', 'MEDIUM', 'PENDING', 'Overlaps with Civil Yamuna inspection #5'),
    
    -- Request 7: Electrical OHE on Line 1 UP (clashing with morning Vande Bharat)
    (7, 'Substation Feeder Breaker CB-09 Diagnostic Test', 'ELECTRICAL', 1, 14, 4, '2026-09-08 05:45:00', '2026-09-08 07:15:00', NULL, NULL, 'Preventive breaker cycle testing', 'HIGH', 'PENDING', 'Clashes with Vande Bharat 22436 and Shatabdi 12004'),
    -- Request 8: Engineering on Tilak Bridge Flyover
    (8, 'Tilak Bridge Flyover Crossover Diamond Alignment', 'ENGINEERING', 15, 5, 2, '2026-09-08 10:00:00', '2026-09-08 12:30:00', NULL, NULL, 'Diamond crossing track geometry adjustment', 'MEDIUM', 'PENDING', 'Zero conflict slot available'),
    
    -- Request 9: S&T Axle Counter on TKJ-ANVT section
    (9, 'Digital Axle Counter DAC-04 Sensor Recalibration', 'SIGNAL_TELECOM', 9, 11, 3, '2026-09-08 13:00:00', '2026-09-08 14:30:00', NULL, NULL, 'Sensor head voltage calibration', 'MEDIUM', 'PENDING', 'Safe window'),
    -- Request 10: Electrical on Ghaziabad EMU Yard
    (10, 'OHE Automatic Tensioning Device ATD-21 Replacement', 'ELECTRICAL', 12, 16, 4, '2026-09-08 11:00:00', '2026-09-08 13:30:00', NULL, NULL, 'Replacing damaged counterweight pulley', 'HIGH', 'PENDING', 'Yard track, minimal mainline disruption'),
    
    -- Requests 11-15: Approved Blocks (already coordinated into night lull or clear windows)
    (11, 'Hindon River Bridge Girder Anti-Corrosion Spray', 'ENGINEERING', 16, 2, 2, '2026-09-08 01:30:00', '2026-09-08 04:30:00', '2026-09-08 01:30:00', '2026-09-08 04:30:00', 'Night lull scheduled painting', 'LOW', 'APPROVED', 'Approved & locked for maintenance.'),
    (12, 'Sahibabad Overtake Loop Turnout Sleeper Renewal', 'ENGINEERING', 11, 4, 2, '2026-09-08 02:00:00', '2026-09-08 04:30:00', '2026-09-08 02:00:00', '2026-09-08 04:30:00', 'Night lull sleeper replacement', 'MEDIUM', 'APPROVED', 'Approved & locked for maintenance.'),
    (13, 'Ghaziabad Electronic Interlocking Software Patching', 'SIGNAL_TELECOM', 1, 10, 3, '2026-09-08 02:30:00', '2026-09-08 04:00:00', '2026-09-08 02:30:00', '2026-09-08 04:00:00', 'SSI firmware upgrade', 'HIGH', 'APPROVED', 'Approved & locked for maintenance.'),
    (14, 'Tilak Bridge Neutral Section NS-03 Contact Check', 'ELECTRICAL', 9, 15, 4, '2026-09-08 02:00:00', '2026-09-08 03:30:00', '2026-09-08 02:00:00', '2026-09-08 03:30:00', 'Neutral section ceramic insulator cleaning', 'LOW', 'APPROVED', 'Approved & locked for maintenance.'),
    (15, 'Sahibabad Loop Point Machine PM-108 Lubrication', 'SIGNAL_TELECOM', 11, 9, 3, '2026-09-08 02:30:00', '2026-09-08 03:30:00', '2026-09-08 02:30:00', '2026-09-08 03:30:00', 'Bundled into Loop block #12', 'LOW', 'APPROVED', 'Shadow block bundled with track civil work'),

    -- Requests 16-20: Completed / historical maintenance blocks
    (16, 'Anand Vihar Coaching Yard Turnout Greasing', 'ENGINEERING', 14, NULL, 2, '2026-09-07 10:00:00', '2026-09-07 12:00:00', '2026-09-07 10:00:00', '2026-09-07 12:00:00', 'Yard maintenance', 'LOW', 'COMPLETED', 'Successfully executed'),
    (17, 'Ghaziabad Freight Yard Shunting Line Rail Joint Welding', 'ENGINEERING', 13, NULL, 2, '2026-09-07 14:00:00', '2026-09-07 16:30:00', '2026-09-07 14:00:00', '2026-09-07 16:30:00', 'Alumino-thermic welding', 'MEDIUM', 'COMPLETED', 'Successfully executed'),
    (18, 'Line 4 EMU Track Ultrasonic Rail Testing (SPURT Car)', 'ENGINEERING', 4, NULL, 2, '2026-09-07 01:00:00', '2026-09-07 04:00:00', '2026-09-07 01:00:00', '2026-09-07 04:00:00', 'Flaw detection test', 'HIGH', 'COMPLETED', 'Successfully executed'),
    (19, 'Down Advance Starter Signal S-22 Lamp Replacement', 'SIGNAL_TELECOM', 2, 7, 3, '2026-09-07 02:00:00', '2026-09-07 03:00:00', '2026-09-07 02:00:00', '2026-09-07 03:00:00', 'LED aspect array replacement', 'LOW', 'COMPLETED', 'Successfully executed'),
    (20, 'Line 3 Catenary Cantilever Insulator Washing', 'ELECTRICAL', 3, NULL, 4, '2026-09-07 02:30:00', '2026-09-07 04:30:00', '2026-09-07 02:30:00', '2026-09-07 04:30:00', 'De-dusting isolators', 'LOW', 'COMPLETED', 'Successfully executed')
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    department = EXCLUDED.department,
    track_id = EXCLUDED.track_id,
    asset_id = EXCLUDED.asset_id,
    requested_by_user_id = EXCLUDED.requested_by_user_id,
    requested_start_time = EXCLUDED.requested_start_time,
    requested_end_time = EXCLUDED.requested_end_time,
    allocated_start_time = EXCLUDED.allocated_start_time,
    allocated_end_time = EXCLUDED.allocated_end_time,
    purpose = EXCLUDED.purpose,
    priority = EXCLUDED.priority,
    status = EXCLUDED.status,
    conflict_remarks = EXCLUDED.conflict_remarks;

-- Reset sequence counters in PostgreSQL
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval('tracks_id_seq', (SELECT COALESCE(MAX(id), 1) FROM tracks));
SELECT setval('assets_id_seq', (SELECT COALESCE(MAX(id), 1) FROM assets));
SELECT setval('trains_id_seq', (SELECT COALESCE(MAX(id), 1) FROM trains));
SELECT setval('schedules_id_seq', (SELECT COALESCE(MAX(id), 1) FROM schedules));
SELECT setval('block_requests_id_seq', (SELECT COALESCE(MAX(id), 1) FROM block_requests));
