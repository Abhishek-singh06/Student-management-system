package com.college.cms.repository;

import com.college.cms.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByCode(String code);
    Boolean existsByCode(String code);
    
    // Pagination & Search support
    Page<Course> findByNameContainingIgnoreCaseOrCodeContainingIgnoreCase(String name, String code, Pageable pageable);
    Page<Course> findByDepartmentIdAndNameContainingIgnoreCaseOrCodeContainingIgnoreCase(Long departmentId, String name, String code, Pageable pageable);
    Page<Course> findByDepartmentId(Long departmentId, Pageable pageable);
}
