package com.college.cms.service;

import com.college.cms.entity.Marks;
import com.college.cms.entity.Student;

import java.io.IOException;
import java.util.List;

public interface ReportExportService {
    byte[] exportStudentsToExcel(List<Student> students) throws IOException;
    byte[] exportReportCardToPdf(Student student, List<Marks> marks) throws IOException;
}
