package com.college.cms.repository;

import com.college.cms.entity.CourseFaculty;
import com.college.cms.entity.CourseFacultyId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseFacultyRepository extends JpaRepository<CourseFaculty, CourseFacultyId> {
    List<CourseFaculty> findByIdFacultyId(Long facultyId);
    List<CourseFaculty> findByIdCourseId(Long courseId);
}
