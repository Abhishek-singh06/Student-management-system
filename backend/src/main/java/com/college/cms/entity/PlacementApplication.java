package com.college.cms.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;

@Entity
@Table(
    name = "placement_applications",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"student_id", "drive_id"})}
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlacementApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drive_id", nullable = false)
    private PlacementDrive drive;

    @CreationTimestamp
    @Column(name = "application_date", updatable = false)
    private LocalDate applicationDate;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String status = "APPLIED"; // 'APPLIED', 'SHORTLISTED', 'PLACED', 'REJECTED'

    @Column(length = 255)
    private String remarks;
}
