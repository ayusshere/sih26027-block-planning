package com.sih.blockplanning.repository;

import com.sih.blockplanning.entity.Asset;
import com.sih.blockplanning.enums.AssetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    List<Asset> findByTrackId(Long trackId);
    List<Asset> findByAssetType(AssetType assetType);
    List<Asset> findByHealthScoreLessThan(Integer healthScore);
}

