package com.college.cms.service.impl;

import com.college.cms.entity.Marks;
import com.college.cms.entity.Student;
import com.college.cms.service.ReportExportService;
import com.lowagie.text.Document;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.Element;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.awt.Color;
import java.util.List;

@Service
public class ReportExportServiceImpl implements ReportExportService {

    @Override
    public byte[] exportStudentsToExcel(List<Student> students) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Students Roster");

        // Header Row Style
        CellStyle headerStyle = workbook.createCellStyle();
        org.apache.poi.ss.usermodel.Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        headerStyle.setFont(font);
        headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        // Header Cells
        Row headerRow = sheet.createRow(0);
        String[] columns = {"Roll Number", "First Name", "Last Name", "Gender", "Phone", "Admission Date", "Department"};
        for (int i = 0; i < columns.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(columns[i]);
            cell.setCellStyle(headerStyle);
        }

        // Data Rows
        int rowIdx = 1;
        for (Student student : students) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(student.getRollNumber());
            row.createCell(1).setCellValue(student.getFirstName());
            row.createCell(2).setCellValue(student.getLastName());
            row.createCell(3).setCellValue(student.getGender());
            row.createCell(4).setCellValue(student.getPhone() != null ? student.getPhone() : "—");
            row.createCell(5).setCellValue(student.getAdmissionDate().toString());
            row.createCell(6).setCellValue(student.getDepartment() != null ? student.getDepartment().getName() : "General");
        }

        // Auto-size columns
        for (int i = 0; i < columns.length; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();
        return out.toByteArray();
    }

    @Override
    public byte[] exportReportCardToPdf(Student student, List<Marks> marks) throws IOException {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);

        document.open();

        // Title Fonts
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new Color(26, 54, 93));
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.DARK_GRAY);
        Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
        Font boldBodyFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);

        // University Banner Title
        Paragraph universityTitle = new Paragraph("CMS UNIVERSITY ACADEMIC TRANSCRIPT", titleFont);
        universityTitle.setAlignment(Element.ALIGN_CENTER);
        universityTitle.setSpacingAfter(20);
        document.add(universityTitle);

        // Student Metadata Box
        PdfPTable metaTable = new PdfPTable(2);
        metaTable.setWidthPercentage(100);
        metaTable.setSpacingAfter(20);

        PdfPCell c1 = new PdfPCell(new Phrase("Student Name: " + student.getFirstName() + " " + student.getLastName(), bodyFont));
        c1.setBorder(Rectangle.NO_BORDER);
        PdfPCell c2 = new PdfPCell(new Phrase("Roll Number: " + student.getRollNumber(), bodyFont));
        c2.setBorder(Rectangle.NO_BORDER);
        PdfPCell c3 = new PdfPCell(new Phrase("Department: " + (student.getDepartment() != null ? student.getDepartment().getName() : "General"), bodyFont));
        c3.setBorder(Rectangle.NO_BORDER);
        PdfPCell c4 = new PdfPCell(new Phrase("Transcript Date: " + LocalDate.now().toString(), bodyFont));
        c4.setBorder(Rectangle.NO_BORDER);

        metaTable.addCell(c1);
        metaTable.addCell(c2);
        metaTable.addCell(c3);
        metaTable.addCell(c4);
        document.add(metaTable);

        // Divider
        document.add(new Paragraph("——————————————————————————————————————————————————"));

        // Grade Card Table
        PdfPTable table = new PdfPTable(7);
        table.setWidthPercentage(100);
        table.setSpacingBefore(15);
        table.setSpacingAfter(25);

        // Set column headings
        String[] headers = {"Code", "Course Title", "Credits", "Int 1", "Int 2", "Semester", "Grade"};
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
            cell.setBackgroundColor(new Color(240, 244, 248));
            cell.setPadding(6);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }

        // Fill grades
        for (Marks mark : marks) {
            table.addCell(new PdfPCell(new Phrase(mark.getCourse().getCode(), boldBodyFont)));
            table.addCell(new PdfPCell(new Phrase(mark.getCourse().getName(), bodyFont)));
            table.addCell(new PdfPCell(new Phrase(String.valueOf(mark.getCourse().getCredits()), bodyFont)));

            // Extract Internal/Semester scores dynamically
            table.addCell(new PdfPCell(new Phrase(getScoreText(mark, "INTERNAL_1"), bodyFont)));
            table.addCell(new PdfPCell(new Phrase(getScoreText(mark, "INTERNAL_2"), bodyFont)));
            table.addCell(new PdfPCell(new Phrase(getScoreText(mark, "SEMESTER"), bodyFont)));
            
            PdfPCell gradeCell = new PdfPCell(new Phrase(mark.getGrade(), boldBodyFont));
            gradeCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(gradeCell);
        }

        document.add(table);

        // Signatures footer
        document.add(new Paragraph("Registrar Signature: __________________", bodyFont));

        document.close();
        return out.toByteArray();
    }

    private String getScoreText(Marks mark, String targetExam) {
        if (mark.getExamType().equalsIgnoreCase(targetExam)) {
            return String.valueOf(mark.getMarksObtained());
        }
        return "—";
    }
}
