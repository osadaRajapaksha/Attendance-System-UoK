package com.example.Attendance_System_UoK.service;

import com.example.Attendance_System_UoK.dto.AuthResponse;
import com.example.Attendance_System_UoK.dto.LoginRequest;
import com.example.Attendance_System_UoK.dto.RegisterRequest;
import com.example.Attendance_System_UoK.model.*;
import com.example.Attendance_System_UoK.repository.*;
import com.example.Attendance_System_UoK.security.JwtUtil;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

@AllArgsConstructor
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    // --- REGISTER ONLY STUDENTS ---
    public AuthResponse register(RegisterRequest request) {

        // Check if email already exists in students
        if (studentRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        // Create Student entity
        Student student = new Student();
        student.setEmail(request.getEmail());
        student.setFullName(request.getFullName());
        student.setUsername(request.getEmail()); // optional
        student.setPassword(passwordEncoder.encode(request.getPassword()));
        student.setRole(Role.ROLE_STUDENT);
        student.setActive(true);
        student.setCreatedAt(LocalDateTime.now());
        student.setUpdatedAt(LocalDateTime.now());

        // Student-specific fields
        student.setStudentId(request.getStudentId());
        student.setBatchYear(request.getBatchYear());
        student.setDegreeProgram(request.getDegreeProgram());
        student.setDepartment(request.getDepartment());
        student.setFaculty(request.getFaculty());

        // Save to DB
        studentRepository.save(student);

        String token = jwtUtil.generateToken(student);

        return new AuthResponse(
                token,
                student.getUsername(),
                student.getEmail(),
                student.getRole(),
                student.getStudentId(),
                null,
                null
        );
    }

    public AuthResponse login(LoginRequest request) {

        // Authenticate with Spring Security
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = null;

        // 1. Check Student
        var studentOpt = studentRepository.findByUsername(request.getUsername());
        if (studentOpt.isPresent()) {
            user = studentOpt.get();
        }

        // 2. Check Teacher
        if (user == null) {
            var teacherOpt = teacherRepository.findByUsername(request.getUsername());
            if (teacherOpt.isPresent()) {
                user = teacherOpt.get();
            }
        }

        // 3. Check Admin
        if (user == null) {
            var adminOpt = adminRepository.findByUsername(request.getUsername());
            if (adminOpt.isPresent()) {
                user = adminOpt.get();
            }
        }

        if (user == null) {
            throw new RuntimeException("User not found");
        }


        // Save into correct repository
        if (user instanceof Student) {
            studentRepository.updateLastLogin(user.getUsername(), LocalDateTime.now());
        } else if (user instanceof Teacher) {
            teacherRepository.updateLastLogin(user.getUsername(), LocalDateTime.now());
        } else if (user instanceof Admin) {
            adminRepository.updateLastLogin(user.getUsername(), LocalDateTime.now());
        }


        // -------------------------------------------------
        // Generate token
        // -------------------------------------------------
        String token = jwtUtil.generateToken(user);

        // Build response
        return new AuthResponse(
                token,
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user instanceof Student ? ((Student) user).getStudentId() : null,
                user instanceof Teacher ? ((Teacher) user).getTeacherId() : null,
                user instanceof Admin ? ((Admin) user).getAdminId() : null
        );
    }


}
