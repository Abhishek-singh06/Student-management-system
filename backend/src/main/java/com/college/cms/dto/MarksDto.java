package com.college.cms.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarksDto {
    private Long id;
    private Long studentId;
    private String studentRollNumber;
    private String studentName;
    private Long courseId;
    private String courseCode;
    private String courseName;
    private String examType; // 'INTERNAL_1', 'INTERNAL_2', 'SEMESTER'
    private Double marksObtained;
    private Double maxMarks;
    private String grade;
}
