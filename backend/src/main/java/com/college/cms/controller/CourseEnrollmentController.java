package com.college.cms.controller;

import com.college.cms.dto.CourseEnrollmentDto;
import com.college.cms.service.CourseEnrollmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
public class CourseEnrollmentController {

    private final CourseEnrollmentService enrollmentService;

    public CourseEnrollmentController(CourseEnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    // Enroll a student in a course
    @PostMapping("/student/{studentId}/course/{courseId}")
    public ResponseEntity<CourseEnrollmentDto> enrollInCourse(
            @PathVariable("studentId") Long studentId,
            @PathVariable("courseId") Long courseId
    ) {
        CourseEnrollmentDto dto = enrollmentService.enrollInCourse(studentId, courseId);
        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }

    // View registered courses for a student
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<CourseEnrollmentDto>> getStudentEnrollments(@PathVariable("studentId") Long studentId) {
        List<CourseEnrollmentDto> enrollments = enrollmentService.getEnrollmentsByStudent(studentId);
        return ResponseEntity.ok(enrollments);
    }

    // View students registered in a course (Admin & Faculty)
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<CourseEnrollmentDto>> getCourseEnrollments(@PathVariable("courseId") Long courseId) {
        List<CourseEnrollmentDto> enrollments = enrollmentService.getEnrollmentsByCourse(courseId);
        return ResponseEntity.ok(enrollments);
    }

    // Drop/Withdraw from a course
    @DeleteMapping("/student/{studentId}/course/{courseId}")
    public ResponseEntity<CourseEnrollmentDto> dropCourse(
            @PathVariable("studentId") Long studentId,
            @PathVariable("courseId") Long courseId
    ) {
        CourseEnrollmentDto dto = enrollmentService.dropCourse(studentId, courseId);
        return ResponseEntity.ok(dto);
    }
}
