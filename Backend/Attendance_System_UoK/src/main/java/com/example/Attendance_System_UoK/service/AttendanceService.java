package com.example.Attendance_System_UoK.service;

import com.example.Attendance_System_UoK.dto.StudentBasicInfo;
import java.util.List;

public interface AttendanceService {
    List<StudentBasicInfo> getAttendanceBySessionId(String sessionId);

    List<com.example.Attendance_System_UoK.dto.AttendanceStatusDTO> getStudentAttendanceStatus(String studentId);

    void manualMarkAttendance(String sessionId, String studentId, String note);

    List<String> getMarkedSessionIdsForStudent(String courseId, String studentId);

    List<com.example.Attendance_System_UoK.dto.CourseAttendanceReportDTO> getCourseAttendanceReport(String courseId);
}