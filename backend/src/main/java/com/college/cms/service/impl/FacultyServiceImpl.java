package com.college.cms.service.impl;

import com.college.cms.dto.CourseFacultyDto;
import com.college.cms.dto.FacultyDto;
import com.college.cms.dto.FacultyResponse;
import com.college.cms.entity.*;
import com.college.cms.exception.ApiException;
import com.college.cms.exception.ResourceNotFoundException;
import com.college.cms.repository.*;
import com.college.cms.service.FacultyService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FacultyServiceImpl implements FacultyService {

    private final FacultyRepository facultyRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;
    private final CourseFacultyRepository courseFacultyRepository;
    private final PasswordEncoder passwordEncoder;

    public FacultyServiceImpl(FacultyRepository facultyRepository,
                              UserRepository userRepository,
                              DepartmentRepository departmentRepository,
                              CourseRepository courseRepository,
                              CourseFacultyRepository courseFacultyRepository,
                              PasswordEncoder passwordEncoder) {
        this.facultyRepository = facultyRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.courseRepository = courseRepository;
        this.courseFacultyRepository = courseFacultyRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public FacultyDto registerFaculty(FacultyDto facultyDto) {
        if (userRepository.existsByUsername(facultyDto.getUsername())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Username already exists.");
        }
        if (userRepository.existsByEmail(facultyDto.getEmail())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email already exists.");
        }
        if (facultyRepository.existsByEmployeeId(facultyDto.getEmployeeId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Employee ID already exists.");
        }

        // 1. Create Core User
        String rawPassword = facultyDto.getPassword() != null && !facultyDto.getPassword().isEmpty()
                ? facultyDto.getPassword() : "password123";

        User user = User.builder()
                .username(facultyDto.getUsername())
                .email(facultyDto.getEmail())
                .password(passwordEncoder.encode(rawPassword))
                .role(Role.FACULTY)
                .status("ACTIVE")
                .build();
        User savedUser = userRepository.save(user);

        // 2. Load Department
        Department department = departmentRepository.findById(facultyDto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", facultyDto.getDepartmentId()));

        // 3. Create Faculty Profile
        Faculty faculty = Faculty.builder()
                .id(savedUser.getId())
                .user(savedUser)
                .employeeId(facultyDto.getEmployeeId())
                .firstName(facultyDto.getFirstName())
                .lastName(facultyDto.getLastName())
                .designation(facultyDto.getDesignation())
                .phone(facultyDto.getPhone())
                .address(facultyDto.getAddress())
                .joiningDate(facultyDto.getJoiningDate())
                .department(department)
                .profilePictureUrl(facultyDto.getProfilePictureUrl())
                .build();
        Faculty savedFaculty = facultyRepository.save(faculty);

        return mapToDto(savedFaculty);
    }

    @Override
    public FacultyDto getFacultyById(Long id) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty", "id", id));
        return mapToDto(faculty);
    }

    @Override
    public FacultyResponse getAllFaculty(int pageNo, int pageSize, String sortBy, String sortDir, String search, Long departmentId) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        Page<Faculty> facultyPage;

        boolean hasSearch = search != null && !search.trim().isEmpty();
        boolean hasDept = departmentId != null;

        if (hasDept && hasSearch) {
            facultyPage = facultyRepository.findByDepartmentIdAndFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmployeeIdContainingIgnoreCase(
                    departmentId, search, search, search, pageable);
        } else if (hasDept) {
            facultyPage = facultyRepository.findByDepartmentId(departmentId, pageable);
        } else if (hasSearch) {
            facultyPage = facultyRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmployeeIdContainingIgnoreCase(
                    search, search, search, pageable);
        } else {
            facultyPage = facultyRepository.findAll(pageable);
        }

        List<Faculty> listOfFaculty = facultyPage.getContent();
        List<FacultyDto> content = listOfFaculty.stream().map(this::mapToDto).collect(Collectors.toList());

        return FacultyResponse.builder()
                .content(content)
                .pageNo(facultyPage.getNumber())
                .pageSize(facultyPage.getSize())
                .totalElements(facultyPage.getTotalElements())
                .totalPages(facultyPage.getTotalPages())
                .last(facultyPage.isLast())
                .build();
    }

    @Override
    @Transactional
    public FacultyDto updateFaculty(Long id, FacultyDto facultyDto) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty", "id", id));
        User user = faculty.getUser();

        if (!user.getUsername().equalsIgnoreCase(facultyDto.getUsername()) &&
                userRepository.existsByUsername(facultyDto.getUsername())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Username already exists.");
        }
        if (!user.getEmail().equalsIgnoreCase(facultyDto.getEmail()) &&
                userRepository.existsByEmail(facultyDto.getEmail())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email already exists.");
        }
        if (!faculty.getEmployeeId().equalsIgnoreCase(facultyDto.getEmployeeId()) &&
                facultyRepository.existsByEmployeeId(facultyDto.getEmployeeId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Employee ID already exists.");
        }

        Department department = departmentRepository.findById(facultyDto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", facultyDto.getDepartmentId()));

        // Update User account
        user.setUsername(facultyDto.getUsername());
        user.setEmail(facultyDto.getEmail());
        if (facultyDto.getPassword() != null && !facultyDto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(facultyDto.getPassword()));
        }
        userRepository.save(user);

        // Update Faculty details
        faculty.setEmployeeId(facultyDto.getEmployeeId());
        faculty.setFirstName(facultyDto.getFirstName());
        faculty.setLastName(facultyDto.getLastName());
        faculty.setDesignation(facultyDto.getDesignation());
        faculty.setPhone(facultyDto.getPhone());
        faculty.setAddress(facultyDto.getAddress());
        faculty.setJoiningDate(facultyDto.getJoiningDate());
        faculty.setDepartment(department);
        faculty.setProfilePictureUrl(facultyDto.getProfilePictureUrl());

        Faculty updatedFaculty = facultyRepository.save(faculty);
        return mapToDto(updatedFaculty);
    }

    @Override
    @Transactional
    public void deleteFaculty(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        userRepository.delete(user);
    }

    @Override
    @Transactional
    public CourseFacultyDto assignCourseToFaculty(CourseFacultyDto dto) {
        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", dto.getCourseId()));
        Faculty faculty = facultyRepository.findById(dto.getFacultyId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty", "id", dto.getFacultyId()));

        CourseFacultyId mappingId = CourseFacultyId.builder()
                .courseId(course.getId())
                .facultyId(faculty.getId())
                .semester(dto.getSemester())
                .academicYear(dto.getAcademicYear())
                .build();

        CourseFaculty mapping = CourseFaculty.builder()
                .id(mappingId)
                .course(course)
                .faculty(faculty)
                .build();

        courseFacultyRepository.save(mapping);

        return CourseFacultyDto.builder()
                .courseId(course.getId())
                .courseCode(course.getCode())
                .courseName(course.getName())
                .facultyId(faculty.getId())
                .facultyName(faculty.getFirstName() + " " + faculty.getLastName())
                .semester(dto.getSemester())
                .academicYear(dto.getAcademicYear())
                .build();
    }

    @Override
    public List<CourseFacultyDto> getAssignedCourses(Long facultyId) {
        // Verify faculty exists
        if (!facultyRepository.existsById(facultyId)) {
            throw new ResourceNotFoundException("Faculty", "id", facultyId);
        }

        List<CourseFaculty> list = courseFacultyRepository.findByIdFacultyId(facultyId);

        return list.stream().map(cf -> CourseFacultyDto.builder()
                .courseId(cf.getCourse().getId())
                .courseCode(cf.getCourse().getCode())
                .courseName(cf.getCourse().getName())
                .facultyId(cf.getFaculty().getId())
                .facultyName(cf.getFaculty().getFirstName() + " " + cf.getFaculty().getLastName())
                .semester(cf.getId().getSemester())
                .academicYear(cf.getId().getAcademicYear())
                .build()).collect(Collectors.toList());
    }

    private FacultyDto mapToDto(Faculty faculty) {
        return FacultyDto.builder()
                .id(faculty.getId())
                .username(faculty.getUser().getUsername())
                .email(faculty.getUser().getEmail())
                .employeeId(faculty.getEmployeeId())
                .firstName(faculty.getFirstName())
                .lastName(faculty.getLastName())
                .designation(faculty.getDesignation())
                .phone(faculty.getPhone())
                .address(faculty.getAddress())
                .joiningDate(faculty.getJoiningDate())
                .departmentId(faculty.getDepartment().getId())
                .departmentName(faculty.getDepartment().getName())
                .profilePictureUrl(faculty.getProfilePictureUrl())
                .build();
    }
}
