package com.example.Attendance_System_UoK.dto;

import com.example.Attendance_System_UoK.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor

public class UserResponse {
    private String id;
    private String username;
    private String email;
    private Role role; // Use Role enum instead of String

    private String teacherId;
    private String position;

    private String fullName;
    private String studentId;
    private String department;
    private String faculty;
    private String degreeProgram;
    private java.util.List<String> archivedCourseIds;

    public UserResponse(String id, String username, String email, Role role, String fullName, String teacherId,
            String position, String studentId,
            String department, String degreeProgram, String faculty, java.util.List<String> archivedCourseIds) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.fullName = fullName;
        this.teacherId = teacherId;
        this.position = position;
        this.studentId = studentId;
        this.department = department;
        this.degreeProgram = degreeProgram;
        this.faculty = faculty;
        this.archivedCourseIds = archivedCourseIds;
    }
}
