package com.example.Attendance_System_UoK.service;

import com.example.Attendance_System_UoK.dto.UserResponse;
import java.util.List;

public interface AdminService {
    List<UserResponse> getAllUsers();

    UserResponse getUserById(String id);

    void deleteUser(String id);

    void resetPassword(String userId, String newPassword);

    List<UserResponse> searchStudents(String query, String faculty, String degreeProgram);

    void createStudent(com.example.Attendance_System_UoK.dto.RegisterRequest request);

    java.util.Map<String, Long> getDashboardStats();
}
