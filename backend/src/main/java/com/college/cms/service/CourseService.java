package com.college.cms.service;

import com.college.cms.dto.CourseDto;
import com.college.cms.dto.CourseResponse;

public interface CourseService {
    CourseDto createCourse(CourseDto courseDto);
    CourseDto getCourseById(Long id);
    CourseResponse getAllCourses(int pageNo, int pageSize, String sortBy, String sortDir, String search, Long departmentId);
    CourseDto updateCourse(Long id, CourseDto courseDto);
    void deleteCourse(Long id);
}
