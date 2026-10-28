package com.college.cms.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlacementDriveDto {
    private Long id;

    @NotBlank(message = "Company name is required")
    private String companyName;

    @NotBlank(message = "Job role description is required")
    private String role;

    private String description;

    @NotNull(message = "Minimum CGPA is required")
    @Min(value = 0, message = "CGPA cannot be negative")
    private Double minimumCgpa;

    @NotNull(message = "Salary package (LPA) is required")
    @Min(value = 0, message = "Package cannot be negative")
    private Double packageLpa;

    @NotNull(message = "Drive date is required")
    private LocalDate driveDate;

    private String status; // 'UPCOMING', 'COMPLETED'
}
