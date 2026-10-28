package com.college.cms.service.impl;

import com.college.cms.dto.PlacementApplicationDto;
import com.college.cms.dto.PlacementDriveDto;
import com.college.cms.entity.Marks;
import com.college.cms.entity.PlacementApplication;
import com.college.cms.entity.PlacementDrive;
import com.college.cms.entity.Student;
import com.college.cms.exception.ApiException;
import com.college.cms.exception.ResourceNotFoundException;
import com.college.cms.repository.MarksRepository;
import com.college.cms.repository.PlacementApplicationRepository;
import com.college.cms.repository.PlacementDriveRepository;
import com.college.cms.repository.StudentRepository;
import com.college.cms.service.PlacementService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlacementServiceImpl implements PlacementService {

    private final PlacementDriveRepository driveRepository;
    private final PlacementApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final MarksRepository marksRepository;

    public PlacementServiceImpl(PlacementDriveRepository driveRepository,
                                PlacementApplicationRepository applicationRepository,
                                StudentRepository studentRepository,
                                MarksRepository marksRepository) {
        this.driveRepository = driveRepository;
        this.applicationRepository = applicationRepository;
        this.studentRepository = studentRepository;
        this.marksRepository = marksRepository;
    }

    @Override
    @Transactional
    public PlacementDriveDto createDrive(PlacementDriveDto dto) {
        PlacementDrive drive = PlacementDrive.builder()
                .companyName(dto.getCompanyName())
                .role(dto.getRole())
                .description(dto.getDescription())
                .minimumCgpa(dto.getMinimumCgpa())
                .packageLpa(dto.getPackageLpa())
                .driveDate(dto.getDriveDate())
                .status("UPCOMING")
                .build();
        PlacementDrive saved = driveRepository.save(drive);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public PlacementApplicationDto applyForDrive(Long studentId, Long driveId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));
        PlacementDrive drive = driveRepository.findById(driveId)
                .orElseThrow(() -> new ResourceNotFoundException("PlacementDrive", "id", driveId));

        // Check if student already applied
        if (applicationRepository.existsByStudentIdAndDriveId(studentId, driveId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "You have already applied for this placement drive.");
        }

        // Calculate CGPA and check eligibility
        Double studentCgpa = calculateStudentCgpa(studentId);
        if (studentCgpa < drive.getMinimumCgpa()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, 
                    String.format("You do not meet the minimum CGPA eligibility. Drive Minimum: %.2f, Your CGPA: %.2f", 
                            drive.getMinimumCgpa(), studentCgpa));
        }

        PlacementApplication application = PlacementApplication.builder()
                .student(student)
                .drive(drive)
                .status("APPLIED")
                .build();

        PlacementApplication saved = applicationRepository.save(application);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public PlacementApplicationDto updateApplicationStatus(Long applicationId, String status, String remarks) {
        PlacementApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("PlacementApplication", "id", applicationId));

        application.setStatus(status.toUpperCase());
        application.setRemarks(remarks);

        // If placed, we can update drive status or log checkout
        PlacementApplication saved = applicationRepository.save(application);
        return mapToDto(saved);
    }

    @Override
    public List<PlacementApplicationDto> getStudentApplications(Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student", "id", studentId);
        }
        return applicationRepository.findByStudentId(studentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<PlacementApplicationDto> getDriveApplications(Long driveId) {
        if (!driveRepository.existsById(driveId)) {
            throw new ResourceNotFoundException("PlacementDrive", "id", driveId);
        }
        return applicationRepository.findByDriveId(driveId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<PlacementDriveDto> getAllDrives() {
        return driveRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public Double calculateStudentCgpa(Long studentId) {
        // Fetch all semester exam records for this student
        List<Marks> semesterMarks = marksRepository.findByStudentId(studentId).stream()
                .filter(m -> m.getExamType().equals("SEMESTER"))
                .collect(Collectors.toList());

        if (semesterMarks.isEmpty()) {
            return 8.0; // Default CGPA for students who haven't finished exams yet
        }

        double totalGradePoints = 0.0;
        double totalCredits = 0.0;

        for (Marks m : semesterMarks) {
            double gradePoints = getGradePoints(m.getGrade());
            double credits = m.getCourse().getCredits();
            
            totalGradePoints += (gradePoints * credits);
            totalCredits += credits;
        }

        if (totalCredits == 0) {
            return 8.0;
        }

        return totalGradePoints / totalCredits;
    }

    private double getGradePoints(String grade) {
        if (grade == null) return 0.0;
        switch (grade.toUpperCase()) {
            case "O": return 10.0;
            case "A+": return 9.0;
            case "A": return 8.0;
            case "B": return 7.0;
            case "C": return 6.0;
            default: return 0.0; // Fail grade
        }
    }

    // Mappers
    private PlacementDriveDto mapToDto(PlacementDrive drive) {
        return PlacementDriveDto.builder()
                .id(drive.getId())
                .companyName(drive.getCompanyName())
                .role(drive.getRole())
                .description(drive.getDescription())
                .minimumCgpa(drive.getMinimumCgpa())
                .packageLpa(drive.getPackageLpa())
                .driveDate(drive.getDriveDate())
                .status(drive.getStatus())
                .build();
    }

    private PlacementApplicationDto mapToDto(PlacementApplication app) {
        return PlacementApplicationDto.builder()
                .id(app.getId())
                .studentId(app.getStudent().getId())
                .studentRollNumber(app.getStudent().getRollNumber())
                .studentName(app.getStudent().getFirstName() + " " + app.getStudent().getLastName())
                .studentCgpa(calculateStudentCgpa(app.getStudent().getId()))
                .driveId(app.getDrive().getId())
                .companyName(app.getDrive().getCompanyName())
                .role(app.getDrive().getRole())
                .applicationDate(app.getApplicationDate())
                .status(app.getStatus())
                .remarks(app.getRemarks())
                .build();
    }
}
