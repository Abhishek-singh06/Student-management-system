package com.college.cms.service.impl;

import com.college.cms.dto.AttendanceDto;
import com.college.cms.dto.AttendanceUploadDto;
import com.college.cms.dto.StudentAttendanceStatusDto;
import com.college.cms.entity.Attendance;
import com.college.cms.entity.Course;
import com.college.cms.entity.Student;
import com.college.cms.exception.ResourceNotFoundException;
import com.college.cms.repository.AttendanceRepository;
import com.college.cms.repository.CourseRepository;
import com.college.cms.repository.StudentRepository;
import com.college.cms.service.AttendanceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;

    public AttendanceServiceImpl(AttendanceRepository attendanceRepository,
                                 CourseRepository courseRepository,
                                 StudentRepository studentRepository) {
        this.attendanceRepository = attendanceRepository;
        this.courseRepository = courseRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    @Transactional
    public List<AttendanceDto> uploadAttendance(AttendanceUploadDto uploadDto) {
        Course course = courseRepository.findById(uploadDto.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", uploadDto.getCourseId()));

        List<Attendance> savedEntries = new ArrayList<>();

        for (StudentAttendanceStatusDto statusDto : uploadDto.getStudentsAttendance()) {
            Student student = studentRepository.findById(statusDto.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student", "id", statusDto.getStudentId()));

            // Find existing entry to make the upload idempotent
            Optional<Attendance> existing = attendanceRepository.findByStudentIdAndCourseIdAndDate(
                    student.getId(), course.getId(), uploadDto.getDate());

            Attendance attendance;
            if (existing.isPresent()) {
                attendance = existing.get();
                attendance.setStatus(statusDto.getStatus().toUpperCase());
                attendance.setRemarks(statusDto.getRemarks());
            } else {
                attendance = Attendance.builder()
                        .student(student)
                        .course(course)
                        .date(uploadDto.getDate())
                        .status(statusDto.getStatus().toUpperCase())
                        .remarks(statusDto.getRemarks())
                        .build();
            }

            savedEntries.add(attendanceRepository.save(attendance));
        }

        return savedEntries.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public List<AttendanceDto> getAttendanceForStudent(Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student", "id", studentId);
        }
        return attendanceRepository.findByStudentId(studentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AttendanceDto> getAttendanceForStudentAndCourse(Long studentId, Long courseId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student", "id", studentId);
        }
        if (!courseRepository.existsById(courseId)) {
            throw new ResourceNotFoundException("Course", "id", courseId);
        }
        return attendanceRepository.findByStudentIdAndCourseId(studentId, courseId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AttendanceDto> getAttendanceForCourseAndDate(Long courseId, LocalDate date) {
        if (!courseRepository.existsById(courseId)) {
            throw new ResourceNotFoundException("Course", "id", courseId);
        }
        return attendanceRepository.findByCourseIdAndDate(courseId, date).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private AttendanceDto mapToDto(Attendance attendance) {
        return AttendanceDto.builder()
                .id(attendance.getId())
                .studentId(attendance.getStudent().getId())
                .studentRollNumber(attendance.getStudent().getRollNumber())
                .studentName(attendance.getStudent().getFirstName() + " " + attendance.getStudent().getLastName())
                .courseId(attendance.getCourse().getId())
                .courseCode(attendance.getCourse().getCode())
                .courseName(attendance.getCourse().getName())
                .date(attendance.getDate())
                .status(attendance.getStatus())
                .remarks(attendance.getRemarks())
                .build();
    }
}
