package com.college.cms.repository;

import com.college.cms.entity.PlacementApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlacementApplicationRepository extends JpaRepository<PlacementApplication, Long> {
    List<PlacementApplication> findByStudentId(Long studentId);
    List<PlacementApplication> findByDriveId(Long driveId);
    Optional<PlacementApplication> findByStudentIdAndDriveId(Long studentId, Long driveId);
    Boolean existsByStudentIdAndDriveId(Long studentId, Long driveId);
}
