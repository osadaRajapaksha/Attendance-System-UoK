package com.example.Attendance_System_UoK.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class RegisterRequest {

    // Common fields
    private String fullName;
    private String email;
    private String password;

    // Student-specific fields
    private String studentId;
    private Integer batchYear;
    private String degreeProgram;
    private String department;
    private String faculty;


}
