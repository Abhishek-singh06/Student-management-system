package com.college.cms.service;

import com.college.cms.dto.StudentDto;
import com.college.cms.dto.StudentResponse;

public interface StudentService {
    StudentDto registerStudent(StudentDto studentDto);
    StudentDto getStudentById(Long id);
    StudentResponse getAllStudents(int pageNo, int pageSize, String sortBy, String sortDir, String search, Long departmentId);
    StudentDto updateStudent(Long id, StudentDto studentDto);
    void deleteStudent(Long id);
}
