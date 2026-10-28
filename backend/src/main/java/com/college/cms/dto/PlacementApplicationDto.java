package com.college.cms.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlacementApplicationDto {
    private Long id;
    private Long studentId;
    private String studentRollNumber;
    private String studentName;
    private Double studentCgpa;
    private Long driveId;
    private String companyName;
    private String role;
    private LocalDate applicationDate;
    private String status; // 'APPLIED', 'SHORTLISTED', 'PLACED', 'REJECTED'
    private String remarks;
}
