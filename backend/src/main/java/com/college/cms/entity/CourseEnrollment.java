package com.college.cms.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;

@Entity
@Table(
    name = "course_enrollments",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"student_id", "course_id"})}
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseEnrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @CreationTimestamp
    @Column(name = "enrollment_date", updatable = false)
    private LocalDate enrollmentDate;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String status = "ACTIVE"; // 'ACTIVE', 'COMPLETED', 'DROPPED'
}
