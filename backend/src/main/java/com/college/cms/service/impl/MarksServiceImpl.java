package com.college.cms.service.impl;

import com.college.cms.dto.MarksDto;
import com.college.cms.dto.MarksUploadDto;
import com.college.cms.dto.StudentMarksDto;
import com.college.cms.entity.Course;
import com.college.cms.entity.Marks;
import com.college.cms.entity.Student;
import com.college.cms.exception.ApiException;
import com.college.cms.exception.ResourceNotFoundException;
import com.college.cms.repository.CourseRepository;
import com.college.cms.repository.MarksRepository;
import com.college.cms.repository.StudentRepository;
import com.college.cms.service.MarksService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MarksServiceImpl implements MarksService {

    private final MarksRepository marksRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;

    public MarksServiceImpl(MarksRepository marksRepository,
                            CourseRepository courseRepository,
                            StudentRepository studentRepository) {
        this.marksRepository = marksRepository;
        this.courseRepository = courseRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    @Transactional
    public List<MarksDto> uploadMarks(MarksUploadDto uploadDto) {
        Course course = courseRepository.findById(uploadDto.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", uploadDto.getCourseId()));

        List<Marks> savedList = new ArrayList<>();

        for (StudentMarksDto scoreDto : uploadDto.getStudentsMarks()) {
            if (scoreDto.getMarksObtained() > scoreDto.getMaxMarks()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, 
                        "Marks obtained cannot exceed max marks for student ID: " + scoreDto.getStudentId());
            }

            Student student = studentRepository.findById(scoreDto.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student", "id", scoreDto.getStudentId()));

            // Determine grade automatically
            String grade = scoreDto.getGrade();
            if (grade == null || grade.trim().isEmpty()) {
                double pct = (scoreDto.getMarksObtained() / scoreDto.getMaxMarks()) * 100;
                if (pct >= 90) grade = "O";
                else if (pct >= 80) grade = "A+";
                else if (pct >= 70) grade = "A";
                else if (pct >= 60) grade = "B";
                else if (pct >= 50) grade = "C";
                else grade = "F";
            }

            // Find existing to support idempotent re-uploads
            Optional<Marks> existing = marksRepository.findByStudentIdAndCourseIdAndExamType(
                    student.getId(), course.getId(), uploadDto.getExamType().toUpperCase());

            Marks marks;
            if (existing.isPresent()) {
                marks = existing.get();
                marks.setMarksObtained(scoreDto.getMarksObtained());
                marks.setMaxMarks(scoreDto.getMaxMarks());
                marks.setGrade(grade);
            } else {
                marks = Marks.builder()
                        .student(student)
                        .course(course)
                        .examType(uploadDto.getExamType().toUpperCase())
                        .marksObtained(scoreDto.getMarksObtained())
                        .maxMarks(scoreDto.getMaxMarks())
                        .grade(grade)
                        .build();
            }

            savedList.add(marksRepository.save(marks));
        }

        return savedList.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public List<MarksDto> getMarksForStudent(Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student", "id", studentId);
        }
        return marksRepository.findByStudentId(studentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<MarksDto> getMarksForStudentAndCourse(Long studentId, Long courseId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student", "id", studentId);
        }
        if (!courseRepository.existsById(courseId)) {
            throw new ResourceNotFoundException("Course", "id", courseId);
        }
        return marksRepository.findByStudentIdAndCourseId(studentId, courseId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<MarksDto> getMarksForCourseAndExamType(Long courseId, String examType) {
        if (!courseRepository.existsById(courseId)) {
            throw new ResourceNotFoundException("Course", "id", courseId);
        }
        return marksRepository.findByCourseIdAndExamType(courseId, examType.toUpperCase()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private MarksDto mapToDto(Marks marks) {
        return MarksDto.builder()
                .id(marks.getId())
                .studentId(marks.getStudent().getId())
                .studentRollNumber(marks.getStudent().getRollNumber())
                .studentName(marks.getStudent().getFirstName() + " " + marks.getStudent().getLastName())
                .courseId(marks.getCourse().getId())
                .courseCode(marks.getCourse().getCode())
                .courseName(marks.getCourse().getName())
                .examType(marks.getExamType())
                .marksObtained(marks.getMarksObtained())
                .maxMarks(marks.getMaxMarks())
                .grade(marks.getGrade())
                .build();
    }
}
