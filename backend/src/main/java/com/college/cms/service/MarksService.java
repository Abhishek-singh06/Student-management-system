package com.college.cms.service;

import com.college.cms.dto.MarksDto;
import com.college.cms.dto.MarksUploadDto;

import java.util.List;

public interface MarksService {
    List<MarksDto> uploadMarks(MarksUploadDto uploadDto);
    List<MarksDto> getMarksForStudent(Long studentId);
    List<MarksDto> getMarksForStudentAndCourse(Long studentId, Long courseId);
    List<MarksDto> getMarksForCourseAndExamType(Long courseId, String examType);
}
