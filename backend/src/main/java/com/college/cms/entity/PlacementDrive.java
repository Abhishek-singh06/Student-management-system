package com.college.cms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "placement_drives")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlacementDrive {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_name", nullable = false, length = 100)
    private String companyName;

    @Column(nullable = false, length = 100)
    private String role;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "minimum_cgpa", nullable = false)
    private Double minimumCgpa;

    @Column(name = "package_lpa", nullable = false)
    private Double packageLpa;

    @Column(name = "drive_date", nullable = false)
    private LocalDate driveDate;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String status = "UPCOMING"; // 'UPCOMING', 'COMPLETED'
}
