package com.college.cms.repository;

import com.college.cms.entity.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, Long> {
    List<Timetable> findByCourseId(Long courseId);
    List<Timetable> findByCourseIdIn(List<Long> courseIds);
}
