package com.college.cms.controller;

import com.college.cms.dto.PlacementApplicationDto;
import com.college.cms.dto.PlacementDriveDto;
import com.college.cms.service.PlacementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/placements")
public class PlacementController {

    private final PlacementService placementService;

    public PlacementController(PlacementService placementService) {
        this.placementService = placementService;
    }

    // Create a new placement drive (Admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/drives")
    public ResponseEntity<PlacementDriveDto> createDrive(@Valid @RequestBody PlacementDriveDto driveDto) {
        PlacementDriveDto saved = placementService.createDrive(driveDto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // Register / Apply a student to a drive
    @PostMapping("/apply/student/{studentId}/drive/{driveId}")
    public ResponseEntity<PlacementApplicationDto> applyForDrive(
            @PathVariable("studentId") Long studentId,
            @PathVariable("driveId") Long driveId
    ) {
        PlacementApplicationDto app = placementService.applyForDrive(studentId, driveId);
        return ResponseEntity.ok(app);
    }

    // Update Application Selection Status (Admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/applications/{applicationId}/status")
    public ResponseEntity<PlacementApplicationDto> updateApplicationStatus(
            @PathVariable("applicationId") Long applicationId,
            @RequestParam("status") String status,
            @RequestParam(value = "remarks", required = false, defaultValue = "") String remarks
    ) {
        PlacementApplicationDto app = placementService.updateApplicationStatus(applicationId, status, remarks);
        return ResponseEntity.ok(app);
    }

    // View registered placement drives for a student
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<PlacementApplicationDto>> getStudentApplications(@PathVariable("studentId") Long studentId) {
        return ResponseEntity.ok(placementService.getStudentApplications(studentId));
    }

    // View applications for a drive (Admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/drives/{driveId}/applications")
    public ResponseEntity<List<PlacementApplicationDto>> getDriveApplications(@PathVariable("driveId") Long driveId) {
        return ResponseEntity.ok(placementService.getDriveApplications(driveId));
    }

    // Get list of all placement drives
    @GetMapping("/drives")
    public ResponseEntity<List<PlacementDriveDto>> getAllDrives() {
        return ResponseEntity.ok(placementService.getAllDrives());
    }

    // Get student calculated CGPA
    @GetMapping("/student/{studentId}/cgpa")
    public ResponseEntity<Double> getStudentCgpa(@PathVariable("studentId") Long studentId) {
        return ResponseEntity.ok(placementService.calculateStudentCgpa(studentId));
    }
}
