package com.college.cms.controller;

import com.college.cms.dto.CourseFacultyDto;
import com.college.cms.dto.FacultyDto;
import com.college.cms.dto.FacultyResponse;
import com.college.cms.service.FacultyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faculty")
public class FacultyController {

    private final FacultyService facultyService;

    public FacultyController(FacultyService facultyService) {
        this.facultyService = facultyService;
    }

    // Register Faculty (Admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<FacultyDto> registerFaculty(@Valid @RequestBody FacultyDto facultyDto) {
        FacultyDto savedFaculty = facultyService.registerFaculty(facultyDto);
        return new ResponseEntity<>(savedFaculty, HttpStatus.CREATED);
    }

    // Get Faculty by ID
    @GetMapping("/{id}")
    public ResponseEntity<FacultyDto> getFacultyById(@PathVariable("id") Long id) {
        FacultyDto facultyDto = facultyService.getFacultyById(id);
        return ResponseEntity.ok(facultyDto);
    }

    // Search and Page Faculty (Admin & Faculty)
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @GetMapping
    public ResponseEntity<FacultyResponse> getAllFaculty(
            @RequestParam(value = "pageNo", defaultValue = "0", required = false) int pageNo,
            @RequestParam(value = "pageSize", defaultValue = "10", required = false) int pageSize,
            @RequestParam(value = "sortBy", defaultValue = "id", required = false) String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "asc", required = false) String sortDir,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "departmentId", required = false) Long departmentId
    ) {
        FacultyResponse response = facultyService.getAllFaculty(pageNo, pageSize, sortBy, sortDir, search, departmentId);
        return ResponseEntity.ok(response);
    }

    // Update Faculty (Admin or Faculty themselves)
    @PutMapping("/{id}")
    public ResponseEntity<FacultyDto> updateFaculty(@PathVariable("id") Long id,
                                                    @Valid @RequestBody FacultyDto facultyDto) {
        FacultyDto updatedFaculty = facultyService.updateFaculty(id, facultyDto);
        return ResponseEntity.ok(updatedFaculty);
    }

    // Delete Faculty (Admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteFaculty(@PathVariable("id") Long id) {
        facultyService.deleteFaculty(id);
        return ResponseEntity.ok("Faculty deleted successfully.");
    }

    // Assign Course to Faculty (Admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/assign-course")
    public ResponseEntity<CourseFacultyDto> assignCourseToFaculty(@Valid @RequestBody CourseFacultyDto dto) {
        CourseFacultyDto assignedDto = facultyService.assignCourseToFaculty(dto);
        return new ResponseEntity<>(assignedDto, HttpStatus.CREATED);
    }

    // View Assigned Courses for Faculty
    @GetMapping("/{id}/courses")
    public ResponseEntity<List<CourseFacultyDto>> getAssignedCourses(@PathVariable("id") Long id) {
        List<CourseFacultyDto> list = facultyService.getAssignedCourses(id);
        return ResponseEntity.ok(list);
    }
}
