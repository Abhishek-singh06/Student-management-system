package com.college.cms.controller;

import com.college.cms.dto.HostelAllocationDto;
import com.college.cms.dto.HostelDto;
import com.college.cms.dto.HostelRoomDto;
import com.college.cms.service.HostelService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hostels")
public class HostelController {

    private final HostelService hostelService;

    public HostelController(HostelService hostelService) {
        this.hostelService = hostelService;
    }

    // Create a new hostel building (Admin)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<HostelDto> createHostel(@Valid @RequestBody HostelDto hostelDto) {
        HostelDto saved = hostelService.createHostel(hostelDto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // Create a room in a hostel (Admin)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/rooms")
    public ResponseEntity<HostelRoomDto> createRoom(@Valid @RequestBody HostelRoomDto roomDto) {
        HostelRoomDto saved = hostelService.createRoom(roomDto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // Allocate room to a student (Admin)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/allocate/student/{studentId}/room/{roomId}")
    public ResponseEntity<HostelAllocationDto> allocateRoom(
            @PathVariable("studentId") Long studentId,
            @PathVariable("roomId") Long roomId
    ) {
        HostelAllocationDto allocation = hostelService.allocateRoom(studentId, roomId);
        return ResponseEntity.ok(allocation);
    }

    // Vacate student room (Admin)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/vacate/student/{studentId}")
    public ResponseEntity<HostelAllocationDto> vacateRoom(@PathVariable("studentId") Long studentId) {
        HostelAllocationDto vacated = hostelService.vacateRoom(studentId);
        return ResponseEntity.ok(vacated);
    }

    // List all hostels (All Auth Users)
    @GetMapping
    public ResponseEntity<List<HostelDto>> getAllHostels() {
        return ResponseEntity.ok(hostelService.getAllHostels());
    }

    // List all rooms for a hostel building (Admin)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{hostelId}/rooms")
    public ResponseEntity<List<HostelRoomDto>> getRoomsByHostel(@PathVariable("hostelId") Long hostelId) {
        return ResponseEntity.ok(hostelService.getRoomsByHostel(hostelId));
    }

    // View active hostel details for a student
    @GetMapping("/student/{studentId}")
    public ResponseEntity<HostelAllocationDto> getCurrentAllocation(@PathVariable("studentId") Long studentId) {
        HostelAllocationDto allocation = hostelService.getCurrentAllocationForStudent(studentId);
        return ResponseEntity.ok(allocation);
    }
}
