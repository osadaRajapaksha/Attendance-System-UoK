package com.example.Attendance_System_UoK.service;

import com.example.Attendance_System_UoK.dto.UserResponse;

public interface StudentService {
    UserResponse getStudentByUsername(String username);
}
