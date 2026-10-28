package com.college.cms.service.impl;

import com.college.cms.dto.TimetableDto;
import com.college.cms.entity.Course;
import com.college.cms.entity.CourseEnrollment;
import com.college.cms.entity.CourseFaculty;
import com.college.cms.entity.Timetable;
import com.college.cms.exception.ResourceNotFoundException;
import com.college.cms.repository.*;
import com.college.cms.service.TimetableService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TimetableServiceImpl implements TimetableService {

    private final TimetableRepository timetableRepository;
    private final CourseRepository courseRepository;
    private final CourseEnrollmentRepository enrollmentRepository;
    private final CourseFacultyRepository courseFacultyRepository;

    public TimetableServiceImpl(TimetableRepository timetableRepository,
                                CourseRepository courseRepository,
                                CourseEnrollmentRepository enrollmentRepository,
                                CourseFacultyRepository courseFacultyRepository) {
        this.timetableRepository = timetableRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.courseFacultyRepository = courseFacultyRepository;
    }

    @Override
    @Transactional
    public TimetableDto createTimetableEntry(TimetableDto dto) {
        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", dto.getCourseId()));

        Timetable timetable = Timetable.builder()
                .course(course)
                .dayOfWeek(dto.getDayOfWeek().toUpperCase())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .roomNumber(dto.getRoomNumber())
                .build();

        Timetable saved = timetableRepository.save(timetable);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public void deleteTimetableEntry(Long id) {
        Timetable timetable = timetableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TimetableEntry", "id", id));
        timetableRepository.delete(timetable);
    }

    @Override
    public List<TimetableDto> getTimetableForStudent(Long studentId) {
        // 1. Get active enrolled courses
        List<CourseEnrollment> enrollments = enrollmentRepository.findByStudentId(studentId);
        List<Long> courseIds = enrollments.stream()
                .filter(e -> e.getStatus().equals("ACTIVE"))
                .map(e -> e.getCourse().getId())
                .collect(Collectors.toList());

        if (courseIds.isEmpty()) {
            return new ArrayList<>();
        }

        // 2. Fetch schedules
        List<Timetable> list = timetableRepository.findByCourseIdIn(courseIds);
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public List<TimetableDto> getTimetableForFaculty(Long facultyId) {
        // 1. Get assigned courses
        List<CourseFaculty> assignments = courseFacultyRepository.findByIdFacultyId(facultyId);
        List<Long> courseIds = assignments.stream()
                .map(a -> a.getCourse().getId())
                .collect(Collectors.toList());

        if (courseIds.isEmpty()) {
            return new ArrayList<>();
        }

        // 2. Fetch schedules
        List<Timetable> list = timetableRepository.findByCourseIdIn(courseIds);
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public List<TimetableDto> getTimetableForCourse(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new ResourceNotFoundException("Course", "id", courseId);
        }
        return timetableRepository.findByCourseId(courseId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TimetableDto> getAllTimetableEntries() {
        return timetableRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // Helper mapping method
    private TimetableDto mapToDto(Timetable timetable) {
        // Determine faculty teaching this course (derive from first match in course_faculty bridge)
        String instructorName = "TBD";
        List<CourseFaculty> facultyList = courseFacultyRepository.findByIdCourseId(timetable.getCourse().getId());
        if (!facultyList.isEmpty()) {
            CourseFaculty cf = facultyList.get(0);
            instructorName = cf.getFaculty().getFirstName() + " " + cf.getFaculty().getLastName();
        }

        return TimetableDto.builder()
                .id(timetable.getId())
                .courseId(timetable.getCourse().getId())
                .courseCode(timetable.getCourse().getCode())
                .courseName(timetable.getCourse().getName())
                .dayOfWeek(timetable.getDayOfWeek())
                .startTime(timetable.getStartTime())
                .endTime(timetable.getEndTime())
                .roomNumber(timetable.getRoomNumber())
                .facultyName(instructorName)
                .build();
    }
}
