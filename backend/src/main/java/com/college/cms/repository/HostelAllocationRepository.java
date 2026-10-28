package com.college.cms.repository;

import com.college.cms.entity.HostelAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HostelAllocationRepository extends JpaRepository<HostelAllocation, Long> {
    Optional<HostelAllocation> findByStudentIdAndStatus(Long studentId, String status);
    List<HostelAllocation> findByRoomIdAndStatus(Long roomId, String status);
    Boolean existsByStudentIdAndStatus(Long studentId, String status);
}
