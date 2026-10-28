package com.college.cms.service;

import com.college.cms.dto.AttendanceDto;
import com.college.cms.dto.AttendanceUploadDto;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {
    List<AttendanceDto> uploadAttendance(AttendanceUploadDto uploadDto);
    List<AttendanceDto> getAttendanceForStudent(Long studentId);
    List<AttendanceDto> getAttendanceForStudentAndCourse(Long studentId, Long courseId);
    List<AttendanceDto> getAttendanceForCourseAndDate(Long courseId, LocalDate date);
}
