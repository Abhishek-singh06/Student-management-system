package com.college.cms.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarksUploadDto {

    @NotNull(message = "Course ID is required")
    private Long courseId;

    @NotBlank(message = "Exam type is required")
    private String examType; // 'INTERNAL_1', 'INTERNAL_2', 'SEMESTER'

    @NotEmpty(message = "Student marks list must not be empty")
    @Valid
    private List<StudentMarksDto> studentsMarks;
}
