package com.college.cms.repository;

import com.college.cms.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByRollNumber(String rollNumber);
    Boolean existsByRollNumber(String rollNumber);
    
    // Clean parameterized search & filter
    @Query("SELECT s FROM Student s WHERE " +
           "(:departmentId IS NULL OR s.department.id = :departmentId) AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(s.rollNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.user.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Student> searchStudents(
            @Param("departmentId") Long departmentId,
            @Param("search") String search,
            Pageable pageable);

    Page<Student> findByDepartmentId(Long departmentId, Pageable pageable);
}
