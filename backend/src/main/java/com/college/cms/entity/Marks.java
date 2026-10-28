package com.college.cms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "marks",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"student_id", "course_id", "exam_type"})}
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Marks {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "exam_type", nullable = false, length = 20)
    private String examType; // 'INTERNAL_1', 'INTERNAL_2', 'SEMESTER'

    @Column(name = "marks_obtained", nullable = false)
    private Double marksObtained;

    @Column(name = "max_marks", nullable = false)
    private Double maxMarks;

    @Column(length = 2)
    private String grade; // 'O', 'A+', 'A', 'B', 'C', 'F'
}
