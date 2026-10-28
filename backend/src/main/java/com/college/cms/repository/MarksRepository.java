package com.college.cms.repository;

import com.college.cms.entity.Marks;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarksRepository extends JpaRepository<Marks, Long> {
    List<Marks> findByStudentId(Long studentId);
    List<Marks> findByStudentIdAndCourseId(Long studentId, Long courseId);
    List<Marks> findByCourseIdAndExamType(Long courseId, String examType);
    Optional<Marks> findByStudentIdAndCourseIdAndExamType(Long studentId, Long courseId, String examType);
}
