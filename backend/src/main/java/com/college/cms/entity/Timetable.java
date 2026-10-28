package com.college.cms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "timetable")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Timetable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "day_of_week", nullable = false, length = 15)
    private String dayOfWeek; // 'MONDAY', 'TUESDAY', etc.

    @Column(name = "start_time", nullable = false, length = 10)
    private String startTime; // e.g., '09:00 AM'

    @Column(name = "end_time", nullable = false, length = 10)
    private String endTime; // e.g., '09:50 AM'

    @Column(name = "room_number", nullable = false, length = 20)
    private String roomNumber; // e.g., 'LH-101'
}
