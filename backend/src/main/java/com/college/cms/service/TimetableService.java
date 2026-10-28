package com.college.cms.service;

import com.college.cms.dto.TimetableDto;
import java.util.List;

public interface TimetableService {
    TimetableDto createTimetableEntry(TimetableDto timetableDto);
    void deleteTimetableEntry(Long id);
    List<TimetableDto> getTimetableForStudent(Long studentId);
    List<TimetableDto> getTimetableForFaculty(Long facultyId);
    List<TimetableDto> getTimetableForCourse(Long courseId);
    List<TimetableDto> getAllTimetableEntries();
}
