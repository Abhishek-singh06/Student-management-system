package com.college.cms.service;

import com.college.cms.dto.CourseEnrollmentDto;
import java.util.List;

public interface CourseEnrollmentService {
    CourseEnrollmentDto enrollInCourse(Long studentId, Long courseId);
    List<CourseEnrollmentDto> getEnrollmentsByStudent(Long studentId);
    List<CourseEnrollmentDto> getEnrollmentsByCourse(Long courseId);
    CourseEnrollmentDto dropCourse(Long studentId, Long courseId);
}
