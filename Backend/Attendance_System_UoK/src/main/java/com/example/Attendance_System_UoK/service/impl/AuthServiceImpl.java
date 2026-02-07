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

        // Extract Student ID from Email
        // Format: name-XXYYZZZ@stu.kln.ac.lk -> XX/20YY/ZZZ
        // Example: madhuma-ec21071@stu.kln.ac.lk -> EC/2021/071
        String email = request.getEmail();
        String studentId = null;

        // Regex to match: any chars + hyphen + 2 letters + 2 digits + 3 or more digits
        // + @stu.kln.ac.lk
        java.util.regex.Pattern pattern = java.util.regex.Pattern
                .compile(".*-([a-zA-Z]{2})(\\d{2})(\\d{3,})@stu\\.kln\\.ac\\.lk$");
        java.util.regex.Matcher matcher = pattern.matcher(email);

        if (matcher.find()) {
            String dept = matcher.group(1).toUpperCase();
            String year = "20" + matcher.group(2);
            String number = matcher.group(3);
            studentId = dept + "/" + year + "/" + number;
        } else {
            // Fallback or Error?
            // Since it is a student registration, we arguably should require this format.
            // OR we fallback to request.getStudentId() if verified?
            // User Request implies we should extract it. If it fails, it's not a valid
            // student email for this system?
            // Let's fallback to manual entry if extraction fails, OR throw error if user
            // insists on only extraction.
            // User said: "no need to input student number in registe.its can axtract by
            // email"
            // So we enforce the email format.
            throw new RuntimeException(
                    "Invalid Student Email Format. Expected: name-deptYearNumber@stu.kln.ac.lk (e.g., name-ec21071@stu.kln.ac.lk)");
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

        student.setStudentId(studentId);
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
