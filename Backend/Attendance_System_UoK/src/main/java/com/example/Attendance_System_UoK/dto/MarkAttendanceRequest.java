package com.example.Attendance_System_UoK.dto;

import lombok.Data;

@Data
public class MarkAttendanceRequest {
    private String sessionId;
    private double lat;
    private double lng;
}
