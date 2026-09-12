package com.sih.blockplanning.repository;

import com.sih.blockplanning.entity.Train;
import com.sih.blockplanning.enums.Priority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrainRepository extends JpaRepository<Train, Long> {
    Optional<Train> findByTrainNumber(String trainNumber);
    List<Train> findByPriority(Priority priority);
}

