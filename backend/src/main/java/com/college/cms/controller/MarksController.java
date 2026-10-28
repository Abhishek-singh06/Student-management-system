package com.college.cms.controller;

import com.college.cms.dto.MarksDto;
import com.college.cms.dto.MarksUploadDto;
import com.college.cms.service.MarksService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marks")
public class MarksController {

    private final MarksService marksService;

    public MarksController(MarksService marksService) {
        this.marksService = marksService;
    }

    // Upload / Record Exam Marks Sheet (Faculty & Admin only)
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @PostMapping("/upload")
    public ResponseEntity<List<MarksDto>> uploadMarks(@Valid @RequestBody MarksUploadDto uploadDto) {
        List<MarksDto> savedList = marksService.uploadMarks(uploadDto);
        return new ResponseEntity<>(savedList, HttpStatus.CREATED);
    }

    // View Marks / Grade Sheets for a Student (Public/Authenticated)
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<MarksDto>> getStudentMarks(@PathVariable("studentId") Long studentId) {
        List<MarksDto> logs = marksService.getMarksForStudent(studentId);
        return ResponseEntity.ok(logs);
    }

    // View Student Marks in a specific Course
    @GetMapping("/student/{studentId}/course/{courseId}")
    public ResponseEntity<List<MarksDto>> getStudentCourseMarks(
            @PathVariable("studentId") Long studentId,
            @PathVariable("courseId") Long courseId
    ) {
        List<MarksDto> logs = marksService.getMarksForStudentAndCourse(studentId, courseId);
        return ResponseEntity.ok(logs);
    }

    // View Marks Sheet for a Course Exam (Faculty & Admin only)
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @GetMapping("/course/{courseId}/exam/{examType}")
    public ResponseEntity<List<MarksDto>> getCourseMarksSheet(
            @PathVariable("courseId") Long courseId,
            @PathVariable("examType") String examType
    ) {
        List<MarksDto> sheet = marksService.getMarksForCourseAndExamType(courseId, examType);
        return ResponseEntity.ok(sheet);
    }
}
