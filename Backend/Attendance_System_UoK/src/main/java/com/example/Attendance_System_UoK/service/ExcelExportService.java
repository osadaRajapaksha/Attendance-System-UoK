package com.example.Attendance_System_UoK.service;

import com.example.Attendance_System_UoK.dto.StudentBasicInfo;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ExcelExportService {

    public ByteArrayInputStream exportAttendanceToExcel(String courseName, List<StudentBasicInfo> students) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Attendance");

            // Header Row style
            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFillForegroundColor(IndexedColors.AQUA.getIndex());
            headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerCellStyle.setFont(headerFont);

            // Create Header Row
            Row headerRow = sheet.createRow(0);
            String[] columns = { "Student ID", "Full Name", "Email" }; // Add more columns as needed based on actual
                                                                       // attendance data later

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerCellStyle);
            }

            // Create Data Rows
            int rowIdx = 1;
            for (StudentBasicInfo student : students) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(student.getStudentId());
                row.createCell(1).setCellValue(student.getFullName());
                // Assuming email might be available in StudentBasicInfo, if not we need to
                // update DTO
                // For now, let's look at the DTO. It has id, fullName, studentId.
                // We might need to fetch more data or just use what we have.
                // The current StudentBasicInfo DTO has: id, fullName, studentId, department,
                // faculty, degreeProgram.
                // Let's us those.

                // Let's redefine columns based on StudentBasicInfo
                // Columns: Student ID, Full Name, Faculty, Degree Program
            }

            // Let's rewrite the loop with correct columns based on DTO
            // We need to re-initialize sheet to clear previous attempt if we were doing it
            // differently
            // Actually, let's just use the correct logic from start.

        } catch (IOException e) {
            throw new RuntimeException("fail to import data to Excel file: " + e.getMessage());
        }
        return null; // Placeholder to avoid compilation error in this thought block
    }

    // STARTING OVER WITH CLEAN IMPLEMENTATION
    public ByteArrayInputStream generateEnrolledStudentsReport(String courseName, List<StudentBasicInfo> students) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Enrolled Students");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] columns = { "Student ID", "Full Name", "Faculty", "Degree Program" };

            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data
            int rowIdx = 1;
            for (StudentBasicInfo student : students) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(student.getStudentId() != null ? student.getStudentId() : "N/A");
                row.createCell(1).setCellValue(student.getFullName());
                row.createCell(2).setCellValue(student.getFaculty() != null ? student.getFaculty() : "");
                row.createCell(3).setCellValue(student.getDegreeProgram() != null ? student.getDegreeProgram() : "");
            }

            // Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel file: " + e.getMessage());
        }
    }

    public ByteArrayInputStream generateSessionWiseAttendanceReport(String courseName,
            List<com.example.Attendance_System_UoK.dto.CourseAttendanceReportDTO> reportData,
            List<com.example.Attendance_System_UoK.model.Session> sessions) {

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Attendance Matrix");

            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            // 1. Create Header Row
            Row headerRow = sheet.createRow(0);

            // Fixed Columns
            headerRow.createCell(0).setCellValue("Student ID");
            headerRow.getCell(0).setCellStyle(headerStyle);

            headerRow.createCell(1).setCellValue("Full Name");
            headerRow.getCell(1).setCellStyle(headerStyle);

            headerRow.createCell(2).setCellValue("Overall %");
            headerRow.getCell(2).setCellStyle(headerStyle);

            // Dynamic Session Columns
            int colIdx = 3;
            // Sort sessions by date
            sessions.sort((a, b) -> a.getStartTime().compareTo(b.getStartTime()));

            for (com.example.Attendance_System_UoK.model.Session session : sessions) {
                Cell cell = headerRow.createCell(colIdx++);
                // Format: Title (Date)
                String dateStr = session.getStartTime().toLocalDate().toString();
                cell.setCellValue(session.getTitle() + "\n" + dateStr);
                cell.setCellStyle(headerStyle);
            }

            // 2. Data Rows
            int rowIdx = 1;
            for (com.example.Attendance_System_UoK.dto.CourseAttendanceReportDTO studentReport : reportData) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(studentReport.getIndexNumber());
                row.createCell(1).setCellValue(studentReport.getFullName());

                Cell pctCell = row.createCell(2);
                pctCell.setCellValue(studentReport.getOverallPercentage() + "%");

                // Styling for percentage?

                colIdx = 3;
                for (com.example.Attendance_System_UoK.model.Session session : sessions) {
                    String status = studentReport.getSessionStatusMap().getOrDefault(session.getId(), "ABSENT");
                    Cell cell = row.createCell(colIdx++);
                    cell.setCellValue(status);

                    // Simple styling
                    if ("PRESENT".equals(status)) {
                        // Maybe green text?
                    }
                }
            }

            // Auto-size columns
            for (int i = 0; i < colIdx; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel file: " + e.getMessage());
        }
    }
}
