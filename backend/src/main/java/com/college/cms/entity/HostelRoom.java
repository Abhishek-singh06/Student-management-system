package com.college.cms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "hostel_rooms",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"hostel_id", "room_number"})}
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HostelRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hostel_id", nullable = false)
    private Hostel hostel;

    @Column(name = "room_number", nullable = false, length = 10)
    private String roomNumber;

    @Column(nullable = false)
    private Integer capacity;

    @Builder.Default
    @Column(nullable = false)
    private Integer occupancy = 0;

    @Column(name = "rent_per_semester", nullable = false)
    private Double rentPerSemester;
}
