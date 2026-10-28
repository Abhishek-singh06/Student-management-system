package com.college.cms.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceDto {
    private Long id;
    private Long studentId;
    private String studentRollNumber;
    private String studentName;
    private Long courseId;
    private String courseCode;
    private String courseName;
    private LocalDate date;
    private String status; // 'PRESENT', 'ABSENT', 'LATE'
    private String remarks;
}
