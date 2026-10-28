package com.college.cms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "course_faculty")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseFaculty {

    @EmbeddedId
    private CourseFacultyId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("courseId")
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("facultyId")
    @JoinColumn(name = "faculty_id")
    private Faculty faculty;
}
