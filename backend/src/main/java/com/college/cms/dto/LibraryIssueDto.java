package com.college.cms.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LibraryIssueDto {
    private Long id;
    private Long studentId;
    private String studentRollNumber;
    private String studentName;
    private Long bookId;
    private String bookTitle;
    private String bookIsbn;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private Double fineAmount;
    private String status; // 'ISSUED', 'RETURNED', 'OVERDUE'
}
