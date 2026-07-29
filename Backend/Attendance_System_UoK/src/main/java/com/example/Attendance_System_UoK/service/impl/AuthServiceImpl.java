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
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtDecoders;
import org.springframework.security.oauth2.jwt.JwtException;

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
    private final com.example.Attendance_System_UoK.service.UserService userService;

    private JwtDecoder asgardeoJwtDecoder = null;

    private JwtDecoder getAsgardeoJwtDecoder() {
        if (asgardeoJwtDecoder == null) {
            asgardeoJwtDecoder = JwtDecoders.fromIssuerLocation("https://api.eu.asgardeo.io/t/attendancesystem/oauth2/token");
        }
        return asgardeoJwtDecoder;
    }

    // REGISTER ONLY STUDENTS
    @Override
    public com.example.Attendance_System_UoK.dto.AuthResponse register(
            com.example.Attendance_System_UoK.dto.RegisterRequest request) {

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
            adminRepository.updateLastLogin(user.getUsername(), LocalDateTime.now());
        }

        String token = jwtUtil.generateToken(user);
        String deviceToken = deviceTokenUtil.encrypt(user.getId());

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setDeviceToken(deviceToken);
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setRole(user.getRole());
        response.setId(user.getId());
        response.setFaculty(user.getFaculty());

        if (user instanceof Student) {
            response.setStudentId(((Student) user).getStudentId());
            response.setDegreeProgram(((Student) user).getDegreeProgram());
        } else if (user instanceof Teacher) {
            response.setTeacherId(((Teacher) user).getTeacherId());
        } else if (user instanceof Admin) {
            response.setAdminId(((Admin) user).getAdminId());
        }

        return response;
    }

    @Override
    public AuthResponse asgardeoLogin(String token) {
        try {
            Jwt jwt = getAsgardeoJwtDecoder().decode(token);
            String email = jwt.getClaimAsString("email");
            if (email == null) {
                email = jwt.getClaimAsString("username");
            }
            if (email == null) {
                throw new RuntimeException("Email claim not found in Asgardeo token");
            }

            User user = userService.findUserByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not registered in the system"));

            if (user instanceof Student) {
                studentRepository.updateLastLogin(user.getUsername(), LocalDateTime.now());
            } else if (user instanceof Teacher) {
                teacherRepository.updateLastLogin(user.getUsername(), LocalDateTime.now());
            } else if (user instanceof Admin) {
                adminRepository.updateLastLogin(user.getUsername(), LocalDateTime.now());
            }

            String appToken = jwtUtil.generateToken(user);
            String deviceToken = deviceTokenUtil.encrypt(user.getId());

            AuthResponse response = new AuthResponse();
            response.setToken(appToken);
            response.setDeviceToken(deviceToken);
            response.setEmail(user.getEmail());
            response.setFullName(user.getFullName());
            response.setRole(user.getRole());
            response.setId(user.getId());
            response.setFaculty(user.getFaculty());

            if (user instanceof Student) {
                response.setStudentId(((Student) user).getStudentId());
                response.setDegreeProgram(((Student) user).getDegreeProgram());
            } else if (user instanceof Teacher) {
                response.setTeacherId(((Teacher) user).getTeacherId());
            } else if (user instanceof Admin) {
                response.setAdminId(((Admin) user).getAdminId());
            }

            return response;

        } catch (JwtException e) {
            throw new RuntimeException("Invalid Asgardeo token: " + e.getMessage());
        }
    }

    @Override
    public AuthResponse asgardeoRegister(String token, String studentId, String degreeProgram, String faculty, String department) {
        try {
            Jwt jwt = getAsgardeoJwtDecoder().decode(token);
            String email = jwt.getClaimAsString("email");
            if (email == null) {
                email = jwt.getClaimAsString("username");
            }
            if (email == null) {
                throw new RuntimeException("Email claim not found in Asgardeo token");
            }
            String fullName = jwt.getClaimAsString("given_name");
            if (fullName == null) fullName = email;

            if (userService.findUserByEmail(email).isPresent()) {
                throw new RuntimeException("User already exists");
            }

            Student student = new Student();
            student.setEmail(email);
            student.setFullName(fullName);
            student.setUsername(email);
            // Since Asgardeo handles auth, we generate a random dummy password or leave it empty if allowed.
            // Spring Security might need a password for the UserDetails, so let's set a random one.
            student.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
            student.setRole(Role.ROLE_STUDENT);
            student.setActive(true);
            student.setCreatedAt(LocalDateTime.now());
            student.setUpdatedAt(LocalDateTime.now());

            student.setStudentId(studentId);
            student.setDegreeProgram(degreeProgram);
            student.setFaculty(faculty);
            student.setDepartment(department);

            studentRepository.save(student);

            String appToken = jwtUtil.generateToken(student);
            String deviceToken = deviceTokenUtil.encrypt(student.getId());

            return new AuthResponse(
                    appToken,
                    deviceToken,
                    student.getEmail(),
                    student.getFullName(),
                    student.getRole(),
                    student.getStudentId(),
                    student.getDegreeProgram(),
                    student.getFaculty()
            );

        } catch (JwtException e) {
            throw new RuntimeException("Invalid Asgardeo token: " + e.getMessage());
        }
    }

    @Override
    public void resetPassword(String email, String otp, String newPassword) {
        // 1. Validate OTP
        if (!otpService.validateOtp(email, otp)) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        // 2. Find User
        User user = userService.findUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with this email"));

        // 3. Update Password
        user.setPassword(passwordEncoder.encode(newPassword));

        // 4. Save User
        userService.saveUser(user);
    }
}
