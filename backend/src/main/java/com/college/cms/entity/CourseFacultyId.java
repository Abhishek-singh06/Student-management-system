package com.college.cms.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseFacultyId implements Serializable {

    @Column(name = "course_id")
    private Long courseId;

    @Column(name = "faculty_id")
    private Long facultyId;

    private Integer semester;

    @Column(name = "academic_year", length = 9)
    private String academicYear;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CourseFacultyId that = (CourseFacultyId) o;
        return Objects.equals(courseId, that.courseId) &&
                Objects.equals(facultyId, that.facultyId) &&
                Objects.equals(semester, that.semester) &&
                Objects.equals(academicYear, that.academicYear);
    }

    @Override
    public int hashCode() {
        return Objects.hash(courseId, facultyId, semester, academicYear);
    }
}
