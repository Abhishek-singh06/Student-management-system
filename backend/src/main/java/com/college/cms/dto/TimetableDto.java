package com.college.cms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimetableDto {

    private Long id;

    @NotNull(message = "Course ID is required")
    private Long courseId;
    
    private String courseCode;
    private String courseName;

    @NotBlank(message = "Day of week is required")
    private String dayOfWeek; // 'MONDAY', 'TUESDAY', etc.

    @NotBlank(message = "Start time is required")
    private String startTime;

    @NotBlank(message = "End time is required")
    private String endTime;

    @NotBlank(message = "Room number is required")
    private String roomNumber;

    private String facultyName; // Derived teaching instructor name
}
