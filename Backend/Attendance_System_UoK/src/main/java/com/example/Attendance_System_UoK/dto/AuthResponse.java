package com.example.Attendance_System_UoK.dto;

import com.example.Attendance_System_UoK.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String deviceToken; // For anti-fraud
    private String email;
    private Role role;
    private String fullName;

    // Optional: include role-specific ID
    private String studentId;
    private String teacherId;
    private String adminId;

    // Database ID
    private String id;

    // Additional Details
    private String degreeProgram;
    private String faculty;

    // 2FA
    private boolean requiresTwoFactor;

    // Standard Constructor
    public AuthResponse(String token, String deviceToken, String email, String fullName, Role role, String studentId,
            String degreeProgram,
            String faculty) {
        this.token = token;
        this.deviceToken = deviceToken;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.studentId = studentId;
        this.degreeProgram = degreeProgram;
        this.faculty = faculty;
        this.requiresTwoFactor = false;
    }

    // 2FA Constructor
    public AuthResponse(boolean requiresTwoFactor, String message) {
        this.requiresTwoFactor = requiresTwoFactor;
        // We can reuse other fields or just leave them null/empty for this specific
        // response case
    }
}
