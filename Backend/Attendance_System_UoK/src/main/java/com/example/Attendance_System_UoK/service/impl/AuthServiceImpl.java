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

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    // REGISTER ONLY STUDENTS
    @Override
    public AuthResponse register(RegisterRequest request) {

        if (studentRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        // Validate Student ID
        String studentId = request.getStudentId();
        if (studentId == null || !studentId.matches("^[A-Z]{2}/\\d{4}/\\d{4,5}$")) {
            throw new RuntimeException(
                    "Invalid Student ID format. Expected format: XX/year/number (e.g., SE/2021/001, SC/2022/12345)");
        }

        // Check if studentId already exists (optional but good practice, though not
        // explicitly asked, avoiding constraint violation is better)
        // Assuming studentId is unique? The user didn't say, but IDs usually are. I
        // won't enforce uniqueness unless I see unique index or user asks, but usually
        // it should be.
        // However, model doesn't show unique constraint. I'll stick to format
        // validation.

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

        return new AuthResponse(
                token,
                student.getEmail(),
                student.getFullName(),
                student.getRole(),
                student.getStudentId());
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
            adminRepository.updateLastLogin(user.getUsername(), LocalDateTime.now());
        }

        String token = jwtUtil.generateToken(user);

        return new AuthResponse(
                token,
                user.getEmail(),
                user.getRole(),
                user.getFullName(),
                user instanceof Student ? ((Student) user).getStudentId() : null,
                user instanceof Teacher ? ((Teacher) user).getTeacherId() : null,
                user instanceof Admin ? ((Admin) user).getAdminId() : null);
    }
}
