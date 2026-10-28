package com.college.cms.repository;

import com.college.cms.entity.Faculty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    Optional<Faculty> findByEmployeeId(String employeeId);
    Boolean existsByEmployeeId(String employeeId);
    
    // Pagination & Search Support
    Page<Faculty> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmployeeIdContainingIgnoreCase(
            String firstName, String lastName, String employeeId, Pageable pageable);
            
    Page<Faculty> findByDepartmentIdAndFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmployeeIdContainingIgnoreCase(
            Long departmentId, String firstName, String lastName, String employeeId, Pageable pageable);
            
    Page<Faculty> findByDepartmentId(Long departmentId, Pageable pageable);
}
