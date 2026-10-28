package com.college.cms.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseDto {

    private Long id;

    @NotBlank(message = "Course code is required")
    @Size(max = 10, message = "Course code must not exceed 10 characters")
    private String code;

    @NotBlank(message = "Course name is required")
    @Size(max = 100, message = "Course name must not exceed 100 characters")
    private String name;

    private String description;

    @NotNull(message = "Course credits is required")
    @Min(value = 1, message = "Credits must be at least 1")
    private Integer credits;

    private Long departmentId;
    private String departmentName;
    private String departmentCode;
}
