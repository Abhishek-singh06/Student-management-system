package com.college.cms.service.impl;

import com.college.cms.dto.CourseDto;
import com.college.cms.dto.CourseResponse;
import com.college.cms.entity.Course;
import com.college.cms.entity.Department;
import com.college.cms.exception.ApiException;
import com.college.cms.exception.ResourceNotFoundException;
import com.college.cms.repository.CourseRepository;
import com.college.cms.repository.DepartmentRepository;
import com.college.cms.service.CourseService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final DepartmentRepository departmentRepository;

    public CourseServiceImpl(CourseRepository courseRepository, DepartmentRepository departmentRepository) {
        this.courseRepository = courseRepository;
        this.departmentRepository = departmentRepository;
    }

    @Override
    public CourseDto createCourse(CourseDto courseDto) {
        // Check duplicate code
        if (courseRepository.existsByCode(courseDto.getCode())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Course code already exists.");
        }

        Department department = null;
        if (courseDto.getDepartmentId() != null) {
            department = departmentRepository.findById(courseDto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", courseDto.getDepartmentId()));
        }

        Course course = mapToEntity(courseDto, department);
        Course savedCourse = courseRepository.save(course);
        return mapToDto(savedCourse);
    }

    @Override
    public CourseDto getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));
        return mapToDto(course);
    }

    @Override
    public CourseResponse getAllCourses(int pageNo, int pageSize, String sortBy, String sortDir, String search, Long departmentId) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        Page<Course> coursesPage;

        boolean hasSearch = search != null && !search.trim().isEmpty();
        boolean hasDept = departmentId != null;

        if (hasDept && hasSearch) {
            coursesPage = courseRepository.findByDepartmentIdAndNameContainingIgnoreCaseOrCodeContainingIgnoreCase(
                    departmentId, search, search, pageable);
        } else if (hasDept) {
            coursesPage = courseRepository.findByDepartmentId(departmentId, pageable);
        } else if (hasSearch) {
            coursesPage = courseRepository.findByNameContainingIgnoreCaseOrCodeContainingIgnoreCase(
                    search, search, pageable);
        } else {
            coursesPage = courseRepository.findAll(pageable);
        }

        List<Course> listOfCourses = coursesPage.getContent();
        List<CourseDto> content = listOfCourses.stream().map(this::mapToDto).collect(Collectors.toList());

        return CourseResponse.builder()
                .content(content)
                .pageNo(coursesPage.getNumber())
                .pageSize(coursesPage.getSize())
                .totalElements(coursesPage.getTotalElements())
                .totalPages(coursesPage.getTotalPages())
                .last(coursesPage.isLast())
                .build();
    }

    @Override
    public CourseDto updateCourse(Long id, CourseDto courseDto) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));

        // Check if code is changing and causes duplicate
        if (!course.getCode().equalsIgnoreCase(courseDto.getCode()) && 
            courseRepository.existsByCode(courseDto.getCode())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Course code already exists.");
        }

        Department department = null;
        if (courseDto.getDepartmentId() != null) {
            department = departmentRepository.findById(courseDto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", courseDto.getDepartmentId()));
        }

        course.setCode(courseDto.getCode());
        course.setName(courseDto.getName());
        course.setDescription(courseDto.getDescription());
        course.setCredits(courseDto.getCredits());
        course.setDepartment(department);

        Course updatedCourse = courseRepository.save(course);
        return mapToDto(updatedCourse);
    }

    @Override
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));
        courseRepository.delete(course);
    }

    // Map Entity to DTO
    private CourseDto mapToDto(Course course) {
        CourseDto.CourseDtoBuilder builder = CourseDto.builder()
                .id(course.getId())
                .code(course.getCode())
                .name(course.getName())
                .description(course.getDescription())
                .credits(course.getCredits());

        if (course.getDepartment() != null) {
            builder.departmentId(course.getDepartment().getId())
                   .departmentName(course.getDepartment().getName())
                   .departmentCode(course.getDepartment().getCode());
        }

        return builder.build();
    }

    // Map DTO to Entity
    private Course mapToEntity(CourseDto courseDto, Department department) {
        return Course.builder()
                .code(courseDto.getCode())
                .name(courseDto.getName())
                .description(courseDto.getDescription())
                .credits(courseDto.getCredits())
                .department(department)
                .build();
    }
}
