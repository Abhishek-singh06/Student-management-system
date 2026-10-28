package com.college.cms.controller;

import com.college.cms.dto.TimetableDto;
import com.college.cms.service.TimetableService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timetable")
public class TimetableController {

    private final TimetableService timetableService;

    public TimetableController(TimetableService timetableService) {
        this.timetableService = timetableService;
    }

    // Create Timetable Slot (Admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<TimetableDto> createTimetableEntry(@Valid @RequestBody TimetableDto timetableDto) {
        TimetableDto saved = timetableService.createTimetableEntry(timetableDto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // Delete Timetable Slot (Admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTimetableEntry(@PathVariable("id") Long id) {
        timetableService.deleteTimetableEntry(id);
        return ResponseEntity.ok("Timetable slot deleted successfully.");
    }

    // View All Slots (Admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<TimetableDto>> getAllTimetableEntries() {
        List<TimetableDto> list = timetableService.getAllTimetableEntries();
        return ResponseEntity.ok(list);
    }

    // View Timetable for Student (Enrolled Courses)
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<TimetableDto>> getTimetableForStudent(@PathVariable("studentId") Long studentId) {
        List<TimetableDto> list = timetableService.getTimetableForStudent(studentId);
        return ResponseEntity.ok(list);
    }

    // View Timetable for Faculty (Assigned Courses)
    @GetMapping("/faculty/{facultyId}")
    public ResponseEntity<List<TimetableDto>> getTimetableForFaculty(@PathVariable("facultyId") Long facultyId) {
        List<TimetableDto> list = timetableService.getTimetableForFaculty(facultyId);
        return ResponseEntity.ok(list);
    }

    // View Timetable for Course
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<TimetableDto>> getTimetableForCourse(@PathVariable("courseId") Long courseId) {
        List<TimetableDto> list = timetableService.getTimetableForCourse(courseId);
        return ResponseEntity.ok(list);
    }
}
