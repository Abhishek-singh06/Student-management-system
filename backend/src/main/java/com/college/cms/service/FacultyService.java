package com.college.cms.service;

import com.college.cms.dto.CourseFacultyDto;
import com.college.cms.dto.FacultyDto;
import com.college.cms.dto.FacultyResponse;
import java.util.List;

public interface FacultyService {
    FacultyDto registerFaculty(FacultyDto facultyDto);
    FacultyDto getFacultyById(Long id);
    FacultyResponse getAllFaculty(int pageNo, int pageSize, String sortBy, String sortDir, String search, Long departmentId);
    FacultyDto updateFaculty(Long id, FacultyDto facultyDto);
    void deleteFaculty(Long id);
    
    // Course-Faculty assignment methods
    CourseFacultyDto assignCourseToFaculty(CourseFacultyDto courseFacultyDto);
    List<CourseFacultyDto> getAssignedCourses(Long facultyId);
}
