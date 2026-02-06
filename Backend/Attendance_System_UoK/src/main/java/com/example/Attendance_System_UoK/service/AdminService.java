package com.example.Attendance_System_UoK.service;

import com.example.Attendance_System_UoK.dto.UserResponse;
import com.example.Attendance_System_UoK.model.User;
import com.example.Attendance_System_UoK.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final com.example.Attendance_System_UoK.repository.StudentRepository studentRepository;
    private final com.example.Attendance_System_UoK.repository.TeacherRepository teacherRepository;
    private final com.example.Attendance_System_UoK.repository.AdminRepository adminRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository,
            com.example.Attendance_System_UoK.repository.StudentRepository studentRepository,
            com.example.Attendance_System_UoK.repository.TeacherRepository teacherRepository,
            com.example.Attendance_System_UoK.repository.AdminRepository adminRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserResponse> getAllUsers() {
        List<UserResponse> allUsers = new java.util.ArrayList<>();

        allUsers.addAll(studentRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList()));

        allUsers.addAll(teacherRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList()));

        allUsers.addAll(adminRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList()));

        return allUsers;
    }

    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToUserResponse(user);
    }

    public void deleteUser(String id) {
        if (studentRepository.existsById(id)) {
            studentRepository.deleteById(id);
        } else if (teacherRepository.existsById(id)) {
            teacherRepository.deleteById(id);
        } else if (adminRepository.existsById(id)) {
            adminRepository.deleteById(id);
        } else {
            userRepository.deleteById(id);
        }
    }

    public List<UserResponse> searchStudents(String query, String faculty, String degreeProgram) {
        String searchQuery = query == null ? "" : query;
        String searchFaculty = (faculty == null || faculty.isEmpty() || faculty.equals("All")) ? "" : faculty;
        String searchDegree = (degreeProgram == null || degreeProgram.isEmpty() || degreeProgram.equals("All")) ? ""
                : degreeProgram;

        return studentRepository.searchStudents(searchQuery, searchFaculty, searchDegree)
                .stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    public void createStudent(com.example.Attendance_System_UoK.dto.RegisterRequest request) {
        if (studentRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        // Basic Student ID Validation
        String studentId = request.getStudentId();
        if (studentId == null || !studentId.matches("^[A-Z]{2}/\\d{4}/\\d{3,5}$")) {
            throw new RuntimeException("Invalid Student ID format. Expected: XX/year/number");
        }

        com.example.Attendance_System_UoK.model.Student student = new com.example.Attendance_System_UoK.model.Student();
        student.setEmail(request.getEmail());
        student.setFullName(request.getFullName());
        student.setUsername(request.getEmail()); // Username is email
        student.setPassword(passwordEncoder.encode(request.getPassword()));
        student.setRole(com.example.Attendance_System_UoK.model.Role.ROLE_STUDENT);
        student.setActive(true);
        student.setCreatedAt(java.time.LocalDateTime.now());
        student.setUpdatedAt(java.time.LocalDateTime.now());

        student.setStudentId(request.getStudentId());
        student.setDegreeProgram(request.getDegreeProgram());
        student.setDepartment(request.getDepartment());
        student.setFaculty(request.getFaculty());

        studentRepository.save(student);
    }

    private UserResponse mapToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setFullName(user.getFullName());

        if (user instanceof com.example.Attendance_System_UoK.model.Student) {
            com.example.Attendance_System_UoK.model.Student student = (com.example.Attendance_System_UoK.model.Student) user;
            response.setStudentId(student.getStudentId());
            response.setDepartment(student.getDepartment());
            response.setFaculty(student.getFaculty());
            response.setDegreeProgram(student.getDegreeProgram());
        }

        return response;
    }
}
