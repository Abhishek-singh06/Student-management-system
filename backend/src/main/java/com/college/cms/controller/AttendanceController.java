package com.college.cms.controller;

import com.college.cms.dto.AttendanceDto;
import com.college.cms.dto.AttendanceUploadDto;
import com.college.cms.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    // Upload / Record Attendance sheet (Faculty & Admin only)
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @PostMapping("/upload")
    public ResponseEntity<List<AttendanceDto>> uploadAttendance(@Valid @RequestBody AttendanceUploadDto uploadDto) {
        List<AttendanceDto> savedList = attendanceService.uploadAttendance(uploadDto);
        return new ResponseEntity<>(savedList, HttpStatus.CREATED);
    }

    // View Attendance Logs for a Student (Public/Authenticated)
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AttendanceDto>> getStudentAttendance(@PathVariable("studentId") Long studentId) {
        List<AttendanceDto> logs = attendanceService.getAttendanceForStudent(studentId);
        return ResponseEntity.ok(logs);
    }

    // View Student Attendance Logs in a Course
    @GetMapping("/student/{studentId}/course/{courseId}")
    public ResponseEntity<List<AttendanceDto>> getStudentCourseAttendance(
            @PathVariable("studentId") Long studentId,
            @PathVariable("courseId") Long courseId
    ) {
        List<AttendanceDto> logs = attendanceService.getAttendanceForStudentAndCourse(studentId, courseId);
        return ResponseEntity.ok(logs);
    }

    // View Attendance Sheet for a Course on a Date (Faculty & Admin only)
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @GetMapping("/course/{courseId}/date/{date}")
    public ResponseEntity<List<AttendanceDto>> getCourseAttendanceSheet(
            @PathVariable("courseId") Long courseId,
            @PathVariable("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        List<AttendanceDto> sheet = attendanceService.getAttendanceForCourseAndDate(courseId, date);
        return ResponseEntity.ok(sheet);
    }
}
