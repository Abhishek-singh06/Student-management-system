package com.college.cms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentAttendanceStatusDto {

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotBlank(message = "Attendance status is required")
    private String status; // 'PRESENT', 'ABSENT', 'LATE'

    private String remarks;
}
