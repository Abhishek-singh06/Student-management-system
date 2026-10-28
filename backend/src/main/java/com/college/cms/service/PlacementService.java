package com.college.cms.service;

import com.college.cms.dto.PlacementApplicationDto;
import com.college.cms.dto.PlacementDriveDto;

import java.util.List;

public interface PlacementService {
    PlacementDriveDto createDrive(PlacementDriveDto driveDto);
    PlacementApplicationDto applyForDrive(Long studentId, Long driveId);
    PlacementApplicationDto updateApplicationStatus(Long applicationId, String status, String remarks);
    List<PlacementApplicationDto> getStudentApplications(Long studentId);
    List<PlacementApplicationDto> getDriveApplications(Long driveId);
    List<PlacementDriveDto> getAllDrives();
    Double calculateStudentCgpa(Long studentId);
}
