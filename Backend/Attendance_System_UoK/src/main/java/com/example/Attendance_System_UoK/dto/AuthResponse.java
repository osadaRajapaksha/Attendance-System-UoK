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
    private String email;
    private Role role;
    private String fullName;

    // Optional: include role-specific ID
    private String studentId;
    private String teacherId;
    private String adminId;

    // Database ID
    private String id;

    public AuthResponse(String token, String email, String fullName, Role role, String studentId) {
        this.token = token;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.studentId = studentId;
    }
}
