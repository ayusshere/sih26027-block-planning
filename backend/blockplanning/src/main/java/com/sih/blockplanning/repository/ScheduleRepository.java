package com.sih.blockplanning.repository;

import com.sih.blockplanning.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findByTrackId(Long trackId);

    // Overlap Query: Finds any train running on the track between startTime and endTime
    @Query("SELECT s FROM Schedule s WHERE s.track.id = :trackId " + "AND s.entryTime < :endTime AND s.exitTime > :startTime")
    List<Schedule> findConflictingSchedules(
            @Param("trackId") Long trackId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );
}

