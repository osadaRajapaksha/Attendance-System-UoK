package com.example.Attendance_System_UoK.service;

public interface OtpService {
    void generateAndSendOtp(String email);

    boolean validateOtp(String email, String otp);
}
