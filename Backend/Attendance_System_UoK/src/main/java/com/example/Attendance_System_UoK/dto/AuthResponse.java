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
    private String username;
    private String email;
    private Role role; // Use Role enum instead of String

    // Optional: include role-specific ID
    private String studentId;
    private String teacherId;
    private String adminId;

    public AuthResponse(String token, String id,String username, String email, Role role) {
        this.token = token;
        this.username = username;
        this.email = email;
        this.role = role;

    }


    public AuthResponse(String token, String username, String email, Role role) {
        this.token = token;
        this.username = username;
        this.email = email;
        this.role = role;
    }
}
