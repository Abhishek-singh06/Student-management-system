package com.college.cms.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HostelRoomDto {
    private Long id;

    @NotNull(message = "Hostel ID is required")
    private Long hostelId;

    private String hostelName;

    @NotBlank(message = "Room number is required")
    private String roomNumber;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    private Integer occupancy;

    @NotNull(message = "Rent per semester is required")
    @Min(value = 0, message = "Rent cannot be negative")
    private Double rentPerSemester;
}
