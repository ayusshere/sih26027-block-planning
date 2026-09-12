package com.sih.blockplanning.repository;

import com.sih.blockplanning.entity.BlockRequest;
import com.sih.blockplanning.enums.BlockStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BlockRequestRepository extends JpaRepository<BlockRequest, Long> {

    List<BlockRequest> findByStatus(BlockStatus status);

    List<BlockRequest> findByTrackId(Long trackId);

    List<BlockRequest> findByRequestedById(Long userId);

    // Finds approved blocks that overlap with the proposed time window
    @Query("SELECT b FROM BlockRequest b WHERE b.track.id = :trackId " +
           "AND b.status = 'APPROVED' " +
           "AND b.allocatedStartTime < :endTime AND b.allocatedEndTime > :startTime")
    List<BlockRequest> findOverlappingApprovedBlocks(
            @Param("trackId") Long trackId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );
}

