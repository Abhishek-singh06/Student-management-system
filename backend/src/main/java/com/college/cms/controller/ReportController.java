package com.college.cms.controller;

import com.college.cms.entity.Marks;
import com.college.cms.entity.Student;
import com.college.cms.exception.ResourceNotFoundException;
import com.college.cms.repository.MarksRepository;
import com.college.cms.repository.StudentRepository;
import com.college.cms.service.ReportExportService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportExportService exportService;
    private final StudentRepository studentRepository;
    private final MarksRepository marksRepository;

    public ReportController(ReportExportService exportService,
                            StudentRepository studentRepository,
                            MarksRepository marksRepository) {
        this.exportService = exportService;
        this.studentRepository = studentRepository;
        this.marksRepository = marksRepository;
    }

    // Download Students list as Excel sheet (Admin & Faculty)
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @GetMapping("/students/excel")
    public void downloadStudentsExcel(HttpServletResponse response) throws IOException {
        List<Student> students = studentRepository.findAll();
        byte[] bytes = exportService.exportStudentsToExcel(students);

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=students_roster.xlsx");
        response.getOutputStream().write(bytes);
        response.getOutputStream().flush();
    }

    // Download Student Academic Report Card as PDF document
    @GetMapping("/student/{studentId}/pdf")
    public void downloadReportCardPdf(
            @PathVariable("studentId") Long studentId,
            HttpServletResponse response
    ) throws IOException {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        List<Marks> marks = marksRepository.findByStudentId(studentId);
        byte[] bytes = exportService.exportReportCardToPdf(student, marks);

        response.setContentType("application/pdf");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=report_card_" + student.getRollNumber() + ".pdf");
        response.getOutputStream().write(bytes);
        response.getOutputStream().flush();
    }
}
