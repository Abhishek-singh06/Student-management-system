package com.college.cms.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseEnrollmentDto {

    private Long id;

    @NotNull(message = "Student ID is required")
    private Long studentId;
    
    private String studentRollNumber;
    private String studentName;

    @NotNull(message = "Course ID is required")
    private Long courseId;
    
    private String courseCode;
    private String courseName;
    private Integer courseCredits;

    private LocalDate enrollmentDate;
    private String status; // 'ACTIVE', 'COMPLETED', 'DROPPED'
}
