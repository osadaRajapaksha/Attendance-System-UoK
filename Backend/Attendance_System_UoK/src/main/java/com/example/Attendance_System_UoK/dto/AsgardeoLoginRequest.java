package com.example.Attendance_System_UoK.dto;

import lombok.Data;

@Data
public class AsgardeoLoginRequest {
    private String email;
    private String studentNumber;
    private String asgardeoToken;
}
