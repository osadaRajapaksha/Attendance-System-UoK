package com.example.Attendance_System_UoK.controller;

import com.example.Attendance_System_UoK.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.regex.Pattern;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/otp")
public class OtpController {

    @Autowired
    private OtpService otpService;

    // Allowed domains: outlook.com, hotmail.com, live.com, kln.ac.lk, stu.kln.ac.lk
    private static final Pattern MICROSOFT_DOMAIN_PATTERN = Pattern.compile(
            "^[A-Za-z0-9._%+-]+@(outlook\\.com|hotmail\\.com|live\\.com|kln\\.ac\\.lk|stu\\.kln\\.ac\\.lk)$",
            Pattern.CASE_INSENSITIVE);

    @PostMapping("/send")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (email == null || !MICROSOFT_DOMAIN_PATTERN.matcher(email).matches()) {
            return ResponseEntity.badRequest()
                    .body("Invalid email domain. Only Microsoft accounts and University emails are allowed.");
        }

        try {
            otpService.generateAndSendOtp(email);
            return ResponseEntity.ok().body(Map.of("message", "OTP sent successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to send OTP");
        }
    }
}
