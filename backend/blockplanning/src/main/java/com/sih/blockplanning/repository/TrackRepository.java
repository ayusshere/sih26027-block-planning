package com.sih.blockplanning.repository;

import com.sih.blockplanning.entity.Track;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrackRepository extends JpaRepository<Track, Long> {
    Optional<Track> findBySectionCode(String sectionCode);
    List<Track> findByStatus(String status);
}
