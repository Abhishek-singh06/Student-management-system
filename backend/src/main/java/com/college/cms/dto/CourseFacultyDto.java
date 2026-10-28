package com.college.cms.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseFacultyDto {

    @NotNull(message = "Course ID is required")
    private Long courseId;
    
    private String courseCode;
    private String courseName;

    @NotNull(message = "Faculty ID is required")
    private Long facultyId;
    
    private String facultyName;

    @NotNull(message = "Semester is required")
    @Min(1)
    @Max(8)
    private Integer semester;

    @NotBlank(message = "Academic year is required")
    private String academicYear; // e.g. "2026-2027"
}
