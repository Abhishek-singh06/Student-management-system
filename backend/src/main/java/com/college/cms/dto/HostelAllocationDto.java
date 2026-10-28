package com.college.cms.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HostelAllocationDto {
    private Long id;
    private Long studentId;
    private String studentRollNumber;
    private String studentName;
    private Long roomId;
    private String roomNumber;
    private String hostelName;
    private LocalDate allocationDate;
    private LocalDate vacatedDate;
    private String status; // 'ACTIVE', 'VACATED'
    private Double rentPerSemester;
}
