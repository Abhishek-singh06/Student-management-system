package com.college.cms.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;

@Entity
@Table(name = "hostel_allocations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HostelAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private HostelRoom room;

    @CreationTimestamp
    @Column(name = "allocation_date", updatable = false)
    private LocalDate allocationDate;

    @Column(name = "vacated_date")
    private LocalDate vacatedDate;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String status = "ACTIVE"; // 'ACTIVE', 'VACATED'
}
