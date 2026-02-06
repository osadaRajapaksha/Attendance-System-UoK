package com.example.Attendance_System_UoK.dto;

import lombok.Data;

@Data
public class ManualMarkRequest {
    private String sessionId;
    private String studentId;
    private String note;
}
