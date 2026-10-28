package com.college.cms.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentDto {

    private Long id; // Maps to user ID

    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String password; // Optional password during registration (if not specified, auto-generate)

    @NotBlank(message = "Registration number is required")
    private String rollNumber;

    @NotBlank(message = "First name is required")
    private String firstName;

    private String lastName;

    private Integer yearOfStudy;

    private LocalDate dateOfBirth;

    private String gender;

    private String phone;
    
    private String address;

    private LocalDate admissionDate;

    @NotNull(message = "Department is required")
    private Long departmentId;
    
    private String departmentName;

    private String profilePictureUrl;
}
