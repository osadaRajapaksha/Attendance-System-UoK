package com.example.Attendance_System_UoK.service.impl;

import com.example.Attendance_System_UoK.dto.AuthResponse;
import com.example.Attendance_System_UoK.dto.LoginRequest;
import com.example.Attendance_System_UoK.dto.RegisterRequest;
import com.example.Attendance_System_UoK.model.*;
import com.example.Attendance_System_UoK.repository.*;
import com.example.Attendance_System_UoK.security.JwtUtil;
import com.example.Attendance_System_UoK.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final com.example.Attendance_System_UoK.service.OtpService otpService;
    private final com.example.Attendance_System_UoK.util.DeviceTokenUtil deviceTokenUtil;

    // REGISTER ONLY STUDENTS
    @Override
    public AuthResponse register(RegisterRequest request) {

        if (studentRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        // Validate OTP
        if (!otpService.validateOtp(request.getEmail(), request.getOtp())) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        // Validate Student ID
        String studentId = request.getStudentId();
        if (studentId == null || !studentId.matches("^[A-Z]{2}/\\d{4}/\\d{3,5}$")) {
            throw new RuntimeException(
                    "Invalid Student ID format. Expected format: XX/year/number (e.g., SE/2021/001, SC/2022/071)");
        }

        Student student = new Student();
        student.setEmail(request.getEmail());
        student.setFullName(request.getFullName());
        student.setUsername(request.getEmail());
        student.setPassword(passwordEncoder.encode(request.getPassword()));
        student.setRole(Role.ROLE_STUDENT);
        student.setActive(true);
        student.setCreatedAt(LocalDateTime.now());
        student.setUpdatedAt(LocalDateTime.now());

        student.setStudentId(request.getStudentId());
        student.setDegreeProgram(request.getDegreeProgram());
        student.setDepartment(request.getDepartment());
        student.setFaculty(request.getFaculty());

        studentRepository.save(student);

        String token = jwtUtil.generateToken(student);
        String deviceToken = deviceTokenUtil.encrypt(student.getId());

        return new AuthResponse(
                token,
                deviceToken,
                student.getEmail(),
                student.getFullName(), // String
                student.getRole(), // Role
                student.getStudentId(),
                student.getDegreeProgram(),
                student.getFaculty());
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()));

        User user = studentRepository.findByUsername(request.getUsername())
                .map(u -> (User) u)
                .orElseGet(() -> teacherRepository.findByUsername(request.getUsername())
                        .map(u -> (User) u)
                        .orElseGet(() -> adminRepository.findByUsername(request.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"))));

        if (user instanceof Student) {
            studentRepository.updateLastLogin(user.getUsername(), LocalDateTime.now());
        } else if (user instanceof Teacher) {
            teacherRepository.updateLastLogin(user.getUsername(), LocalDateTime.now());
        } else if (user instanceof Admin) {
            // ADMIN 2FA LOGIC
            // If OTP is NOT provided, generate and send it
            if (request.getOtp() == null || request.getOtp().isEmpty()) {
                otpService.generateAndSendOtp(user.getEmail());
                return new AuthResponse(true, "OTP required");
            }

            // If OTP IS provided, validate it
            if (!otpService.validateOtp(user.getEmail(), request.getOtp())) {
                throw new RuntimeException("Invalid or expired OTP");
            }

            adminRepository.updateLastLogin(user.getUsername(), LocalDateTime.now());
        }

        String token = jwtUtil.generateToken(user);
        String deviceToken = deviceTokenUtil.encrypt(user.getId());

        return new AuthResponse(
                token,
                deviceToken,
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user instanceof Student ? ((Student) user).getStudentId() : null,
                user instanceof Student ? ((Student) user).getDegreeProgram() : null,
                user.getFaculty());
    }

    @Override
    public void resetPassword(String email, String otp, String newPassword) {
        // 1. Validate OTP
        if (!otpService.validateOtp(email, otp)) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        // 2. Find User
        com.example.Attendance_System_UoK.service.UserService userService = new com.example.Attendance_System_UoK.service.UserService(
                studentRepository, teacherRepository, adminRepository, passwordEncoder);

        User user = userService.findUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with this email"));

        // 3. Update Password
        user.setPassword(passwordEncoder.encode(newPassword));

        // 4. Save User
        userService.saveUser(user);
    }
}
