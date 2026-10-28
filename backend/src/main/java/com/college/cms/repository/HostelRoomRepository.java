package com.college.cms.repository;

import com.college.cms.entity.HostelRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HostelRoomRepository extends JpaRepository<HostelRoom, Long> {
    List<HostelRoom> findByHostelId(Long hostelId);
    Optional<HostelRoom> findByHostelIdAndRoomNumber(Long hostelId, String roomNumber);
    Boolean existsByHostelIdAndRoomNumber(Long hostelId, String roomNumber);
}
