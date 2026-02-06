package com.example.Attendance_System_UoK.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CourseAttendanceReportDTO {
    private String studentId; // database ID
    private String fullName;
    private String indexNumber; // Student ID (e.g. SE/2021/...)
    private Map<String, String> sessionStatusMap; // SessionID -> Status (PRESENT, ABSENT, EXCUSED)
    private double overallPercentage;
}
