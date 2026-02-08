package com.example.Attendance_System_UoK.service;

import com.example.Attendance_System_UoK.dto.StudentBasicInfo;
import com.example.Attendance_System_UoK.dto.CourseAttendanceReportDTO;
import com.example.Attendance_System_UoK.model.Session;
import java.io.ByteArrayInputStream;
import java.util.List;

public interface ExcelExportService {
    ByteArrayInputStream exportAttendanceToExcel(String courseName, List<StudentBasicInfo> students);

    ByteArrayInputStream generateEnrolledStudentsReport(String courseName, List<StudentBasicInfo> students);

    ByteArrayInputStream generateSessionWiseAttendanceReport(String courseName,
            List<CourseAttendanceReportDTO> reportData, List<Session> sessions);
}
