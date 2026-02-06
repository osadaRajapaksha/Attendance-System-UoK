package com.example.Attendance_System_UoK.dto;

import com.example.Attendance_System_UoK.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String id;
    private String username;
    private String email;
    private Role role; // Use Role enum instead of String

    private String fullName;
    private String studentId;
    private String department;
    private String faculty;
    private String degreeProgram;

    public UserResponse(String id, String username, String email, Role role, String fullName, String studentId,
            String degreeProgram, String faculty) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.fullName = fullName;
        this.studentId = studentId;
        this.degreeProgram = degreeProgram;
        this.faculty = faculty;
    }
}
