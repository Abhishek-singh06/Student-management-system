package com.college.cms.service.impl;

import com.college.cms.dto.StudentDto;
import com.college.cms.dto.StudentResponse;
import com.college.cms.entity.Department;
import com.college.cms.entity.Role;
import com.college.cms.entity.Student;
import com.college.cms.entity.User;
import com.college.cms.exception.ApiException;
import com.college.cms.exception.ResourceNotFoundException;
import com.college.cms.repository.DepartmentRepository;
import com.college.cms.repository.StudentRepository;
import com.college.cms.repository.UserRepository;
import com.college.cms.service.StudentService;
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
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    public StudentServiceImpl(StudentRepository studentRepository,
                              UserRepository userRepository,
                              DepartmentRepository departmentRepository,
                              PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public StudentDto registerStudent(StudentDto studentDto) {
        String username = studentDto.getUsername();
        if (username == null || username.trim().isEmpty()) {
            username = studentDto.getRollNumber().trim().toLowerCase();
        }

        // Validate duplicates
        if (userRepository.existsByUsername(username)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Registration number / Username already exists.");
        }
        if (userRepository.existsByEmail(studentDto.getEmail())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email already exists.");
        }
        if (studentRepository.existsByRollNumber(studentDto.getRollNumber())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Registration number already exists.");
        }

        // 1. Create and save core User Account
        String rawPassword = studentDto.getPassword() != null && !studentDto.getPassword().isEmpty() 
                ? studentDto.getPassword() : "password123"; // default temp password
        
        User user = User.builder()
                .username(username)
                .email(studentDto.getEmail())
                .password(passwordEncoder.encode(rawPassword))
                .role(Role.STUDENT)
                .status("ACTIVE")
                .build();
        User savedUser = userRepository.save(user);

        // 2. Load Department
        Department department = departmentRepository.findById(studentDto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", studentDto.getDepartmentId()));

        // Sane defaults for optional attributes
        java.time.LocalDate dob = studentDto.getDateOfBirth() != null 
                ? studentDto.getDateOfBirth() : java.time.LocalDate.of(2004, 1, 1);
        java.time.LocalDate admission = studentDto.getAdmissionDate() != null 
                ? studentDto.getAdmissionDate() : java.time.LocalDate.now();
        String gender = studentDto.getGender() != null && !studentDto.getGender().isEmpty() 
                ? studentDto.getGender() : "OTHER";
        Integer year = studentDto.getYearOfStudy() != null ? studentDto.getYearOfStudy() : 1;

        // 3. Create and save Student Profile
        Student student = Student.builder()
                .id(savedUser.getId())
                .user(savedUser)
                .rollNumber(studentDto.getRollNumber())
                .firstName(studentDto.getFirstName())
                .lastName(studentDto.getLastName() != null ? studentDto.getLastName() : "")
                .yearOfStudy(year)
                .dateOfBirth(dob)
                .gender(gender)
                .phone(studentDto.getPhone())
                .address(studentDto.getAddress())
                .admissionDate(admission)
                .department(department)
                .profilePictureUrl(studentDto.getProfilePictureUrl())
                .build();
        Student savedStudent = studentRepository.save(student);

        return mapToDto(savedStudent);
    }

    @Override
    public StudentDto getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
        return mapToDto(student);
    }

    @Override
    public StudentResponse getAllStudents(int pageNo, int pageSize, String sortBy, String sortDir, String search, Long departmentId) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        Page<Student> studentsPage = studentRepository.searchStudents(departmentId, search, pageable);

        List<Student> listOfStudents = studentsPage.getContent();
        List<StudentDto> content = listOfStudents.stream().map(this::mapToDto).collect(Collectors.toList());

        return StudentResponse.builder()
                .content(content)
                .pageNo(studentsPage.getNumber())
                .pageSize(studentsPage.getSize())
                .totalElements(studentsPage.getTotalElements())
                .totalPages(studentsPage.getTotalPages())
                .last(studentsPage.isLast())
                .build();
    }

    @Override
    @Transactional
    public StudentDto updateStudent(Long id, StudentDto studentDto) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
        User user = student.getUser();

        String newUsername = studentDto.getUsername() != null && !studentDto.getUsername().isEmpty()
                ? studentDto.getUsername() : user.getUsername();

        // Validate duplicates if username/email/roll number changes
        if (!user.getUsername().equalsIgnoreCase(newUsername) && 
            userRepository.existsByUsername(newUsername)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Username already exists.");
        }
        if (!user.getEmail().equalsIgnoreCase(studentDto.getEmail()) && 
            userRepository.existsByEmail(studentDto.getEmail())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email already exists.");
        }
        if (!student.getRollNumber().equalsIgnoreCase(studentDto.getRollNumber()) && 
            studentRepository.existsByRollNumber(studentDto.getRollNumber())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Registration number already exists.");
        }

        Department department = departmentRepository.findById(studentDto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", studentDto.getDepartmentId()));

        // Update User account
        user.setUsername(newUsername);
        user.setEmail(studentDto.getEmail());
        if (studentDto.getPassword() != null && !studentDto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(studentDto.getPassword()));
        }
        userRepository.save(user);

        // Update Student details
        student.setRollNumber(studentDto.getRollNumber());
        student.setFirstName(studentDto.getFirstName());
        if (studentDto.getLastName() != null) student.setLastName(studentDto.getLastName());
        if (studentDto.getYearOfStudy() != null) student.setYearOfStudy(studentDto.getYearOfStudy());
        if (studentDto.getDateOfBirth() != null) student.setDateOfBirth(studentDto.getDateOfBirth());
        if (studentDto.getGender() != null) student.setGender(studentDto.getGender());
        if (studentDto.getPhone() != null) student.setPhone(studentDto.getPhone());
        if (studentDto.getAddress() != null) student.setAddress(studentDto.getAddress());
        if (studentDto.getAdmissionDate() != null) student.setAdmissionDate(studentDto.getAdmissionDate());
        student.setDepartment(department);
        if (studentDto.getProfilePictureUrl() != null) student.setProfilePictureUrl(studentDto.getProfilePictureUrl());
        
        Student updatedStudent = studentRepository.save(student);
        return mapToDto(updatedStudent);
    }

    @Override
    @Transactional
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
        User user = student.getUser();
        studentRepository.delete(student);
        if (user != null) {
            userRepository.delete(user);
        }
    }

    private StudentDto mapToDto(Student student) {
        return StudentDto.builder()
                .id(student.getId())
                .username(student.getUser().getUsername())
                .email(student.getUser().getEmail())
                .rollNumber(student.getRollNumber())
                .firstName(student.getFirstName())
                .lastName(student.getLastName())
                .yearOfStudy(student.getYearOfStudy())
                .dateOfBirth(student.getDateOfBirth())
                .gender(student.getGender())
                .phone(student.getPhone())
                .address(student.getAddress())
                .admissionDate(student.getAdmissionDate())
                .departmentId(student.getDepartment() != null ? student.getDepartment().getId() : null)
                .departmentName(student.getDepartment() != null ? student.getDepartment().getName() : "N/A")
                .profilePictureUrl(student.getProfilePictureUrl())
                .build();
    }
}
