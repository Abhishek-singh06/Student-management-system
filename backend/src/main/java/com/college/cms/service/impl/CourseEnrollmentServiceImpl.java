package com.college.cms.service.impl;

import com.college.cms.dto.CourseEnrollmentDto;
import com.college.cms.entity.Course;
import com.college.cms.entity.CourseEnrollment;
import com.college.cms.entity.Student;
import com.college.cms.exception.ApiException;
import com.college.cms.exception.ResourceNotFoundException;
import com.college.cms.repository.CourseEnrollmentRepository;
import com.college.cms.repository.CourseRepository;
import com.college.cms.repository.StudentRepository;
import com.college.cms.service.CourseEnrollmentService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseEnrollmentServiceImpl implements CourseEnrollmentService {

    private final CourseEnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;

    public CourseEnrollmentServiceImpl(CourseEnrollmentRepository enrollmentRepository,
                                       StudentRepository studentRepository,
                                       CourseRepository courseRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
    }

    @Override
    @Transactional
    public CourseEnrollmentDto enrollInCourse(Long studentId, Long courseId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        // Check if student already enrolled
        List<CourseEnrollment> existingList = enrollmentRepository.findByStudentId(studentId);
        CourseEnrollment existing = existingList.stream()
                .filter(e -> e.getCourse().getId().equals(courseId))
                .findFirst().orElse(null);

        if (existing != null) {
            if (existing.getStatus().equals("ACTIVE")) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Student is already enrolled in this course.");
            } else {
                // Reactivate dropped enrollment
                existing.setStatus("ACTIVE");
                existing.setEnrollmentDate(LocalDate.now());
                CourseEnrollment reactivated = enrollmentRepository.save(existing);
                return mapToDto(reactivated);
            }
        }

        CourseEnrollment enrollment = CourseEnrollment.builder()
                .student(student)
                .course(course)
                .status("ACTIVE")
                .build();

        CourseEnrollment saved = enrollmentRepository.save(enrollment);
        return mapToDto(saved);
    }

    @Override
    public List<CourseEnrollmentDto> getEnrollmentsByStudent(Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student", "id", studentId);
        }
        return enrollmentRepository.findByStudentId(studentId).stream()
                .filter(e -> e.getStatus().equals("ACTIVE"))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<CourseEnrollmentDto> getEnrollmentsByCourse(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new ResourceNotFoundException("Course", "id", courseId);
        }
        return enrollmentRepository.findByCourseId(courseId).stream()
                .filter(e -> e.getStatus().equals("ACTIVE"))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CourseEnrollmentDto dropCourse(Long studentId, Long courseId) {
        List<CourseEnrollment> existingList = enrollmentRepository.findByStudentId(studentId);
        CourseEnrollment enrollment = existingList.stream()
                .filter(e -> e.getCourse().getId().equals(courseId) && e.getStatus().equals("ACTIVE"))
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No active enrollment found for this course."));

        enrollment.setStatus("DROPPED");
        CourseEnrollment saved = enrollmentRepository.save(enrollment);
        return mapToDto(saved);
    }

    private CourseEnrollmentDto mapToDto(CourseEnrollment enrollment) {
        return CourseEnrollmentDto.builder()
                .id(enrollment.getId())
                .studentId(enrollment.getStudent().getId())
                .studentRollNumber(enrollment.getStudent().getRollNumber())
                .studentName(enrollment.getStudent().getFirstName() + " " + enrollment.getStudent().getLastName())
                .courseId(enrollment.getCourse().getId())
                .courseCode(enrollment.getCourse().getCode())
                .courseName(enrollment.getCourse().getName())
                .courseCredits(enrollment.getCourse().getCredits())
                .enrollmentDate(enrollment.getEnrollmentDate())
                .status(enrollment.getStatus())
                .build();
    }
}
