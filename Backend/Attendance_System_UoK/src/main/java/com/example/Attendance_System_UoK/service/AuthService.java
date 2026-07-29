package com.example.Attendance_System_UoK.service;

import com.example.Attendance_System_UoK.dto.AuthResponse;
import com.example.Attendance_System_UoK.dto.LoginRequest;
import com.example.Attendance_System_UoK.dto.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse asgardeoLogin(String token);

    AuthResponse asgardeoRegister(String token, String studentId, String degreeProgram, String faculty, String department);

    void resetPassword(String email, String otp, String newPassword);
}
