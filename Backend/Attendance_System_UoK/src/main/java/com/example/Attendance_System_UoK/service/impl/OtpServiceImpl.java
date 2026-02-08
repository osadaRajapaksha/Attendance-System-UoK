package com.example.Attendance_System_UoK.service.impl;

import com.example.Attendance_System_UoK.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpServiceImpl implements OtpService {

    private static final Logger logger = LoggerFactory.getLogger(OtpServiceImpl.class);

    @Autowired
    private JavaMailSender mailSender;

    // In-memory storage for OTPs. In production, use Redis.
    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();
    private final Map<String, Long> otpExpiration = new ConcurrentHashMap<>();

    // OTP validity duration (5 minutes)
    private static final long OTP_VALID_DURATION = 5 * 60 * 1000;

    @Override
    public void generateAndSendOtp(String email) {
        String otp = String.valueOf(new Random().nextInt(900000) + 100000); // 6 digits

        otpStorage.put(email, otp);
        otpExpiration.put(email, System.currentTimeMillis() + OTP_VALID_DURATION);

        logger.info("Generated OTP for {}: {}", email, otp);

        sendEmail(email, otp);
    }

    private void sendEmail(String to, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Your Registration OTP");
            message.setText("Your OTP for registration is: " + otp + "\n\nThis code expires in 5 minutes.");

            mailSender.send(message);
            logger.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            logger.error("Failed to send email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }

    @Override
    public boolean validateOtp(String email, String otp) {
        if (!otpStorage.containsKey(email)) {
            return false;
        }

        if (System.currentTimeMillis() > otpExpiration.get(email)) {
            otpStorage.remove(email);
            otpExpiration.remove(email);
            return false;
        }

        String storedOtp = otpStorage.get(email);
        if (storedOtp.equals(otp)) {
            // Clear OTP after successful validation
            otpStorage.remove(email);
            otpExpiration.remove(email);
            return true;
        }

        return false;
    }
}
