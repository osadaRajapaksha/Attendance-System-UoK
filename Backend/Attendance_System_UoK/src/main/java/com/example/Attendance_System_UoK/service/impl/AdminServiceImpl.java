package com.example.Attendance_System_UoK.service.impl;

import com.example.Attendance_System_UoK.dto.UserResponse;
import com.example.Attendance_System_UoK.model.User;
import com.example.Attendance_System_UoK.repository.UserRepository;
import com.example.Attendance_System_UoK.service.AdminService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final com.example.Attendance_System_UoK.repository.StudentRepository studentRepository;
    private final com.example.Attendance_System_UoK.repository.TeacherRepository teacherRepository;
    private final com.example.Attendance_System_UoK.repository.AdminRepository adminRepository;
    private final com.example.Attendance_System_UoK.repository.CourseRepository courseRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public AdminServiceImpl(UserRepository userRepository,
            com.example.Attendance_System_UoK.repository.StudentRepository studentRepository,
            com.example.Attendance_System_UoK.repository.TeacherRepository teacherRepository,
            com.example.Attendance_System_UoK.repository.AdminRepository adminRepository,
            com.example.Attendance_System_UoK.repository.CourseRepository courseRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.adminRepository = adminRepository;
        this.courseRepository = courseRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
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

    @Override
    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToUserResponse(user);
    }

    @Override
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

    @Override
    public void resetPassword(String userId, String newPassword) {
        String encodedPassword = passwordEncoder.encode(newPassword);

        // Check Student
        java.util.Optional<com.example.Attendance_System_UoK.model.Student> studentOpt = studentRepository
                .findById(userId);
        if (studentOpt.isPresent()) {
            com.example.Attendance_System_UoK.model.Student student = studentOpt.get();
            student.setPassword(encodedPassword);
            studentRepository.save(student);
            return;
        }

        // Check Teacher
        java.util.Optional<com.example.Attendance_System_UoK.model.Teacher> teacherOpt = teacherRepository
                .findById(userId);
        if (teacherOpt.isPresent()) {
            com.example.Attendance_System_UoK.model.Teacher teacher = teacherOpt.get();
            teacher.setPassword(encodedPassword);
            teacherRepository.save(teacher);
            return;
        }

        // Check Admin
        java.util.Optional<com.example.Attendance_System_UoK.model.Admin> adminOpt = adminRepository.findById(userId);
        if (adminOpt.isPresent()) {
            com.example.Attendance_System_UoK.model.Admin admin = adminOpt.get();
            admin.setPassword(encodedPassword);
            adminRepository.save(admin);
            return;
        }

        // Fallback to strict User repo (though likely not used if separate collections)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(encodedPassword);
        userRepository.save(user);
    }

    @Override
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

    @Override
    public void createStudent(com.example.Attendance_System_UoK.dto.RegisterRequest request) {
        if (studentRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        // Extract or Validate Student ID
        String studentId = request.getStudentId();

        // If ID is not provided, try to extract from email
        if (studentId == null || studentId.trim().isEmpty()) {
            java.util.regex.Pattern pattern = java.util.regex.Pattern
                    .compile(".*-([a-zA-Z]{2})(\\d{2})(\\d{3,})@stu\\.kln\\.ac\\.lk$");
            java.util.regex.Matcher matcher = pattern.matcher(request.getEmail());

            if (matcher.find()) {
                String dept = matcher.group(1).toUpperCase();
                String year = "20" + matcher.group(2);
                String number = matcher.group(3);
                studentId = dept + "/" + year + "/" + number;
            } else {
                throw new RuntimeException(
                        "Invalid Student Email Format for ID extraction. Expected: name-deptYearNumber@stu.kln.ac.lk");
            }
        } else {
            // If ID provided manually, validate format
            if (!studentId.matches("^[A-Z]{2}/\\d{4}/\\d{3,5}$")) {
                throw new RuntimeException("Invalid Student ID format. Expected: XX/year/number");
            }
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

        student.setStudentId(studentId);
        student.setDegreeProgram(request.getDegreeProgram());
        student.setDepartment(request.getDepartment());
        student.setFaculty(request.getFaculty());

        studentRepository.save(student);
    }

    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getFullName(),
                user instanceof com.example.Attendance_System_UoK.model.Teacher
                        ? ((com.example.Attendance_System_UoK.model.Teacher) user).getTeacherId()
                        : null,
                user instanceof com.example.Attendance_System_UoK.model.Teacher
                        ? ((com.example.Attendance_System_UoK.model.Teacher) user).getPosition()
                        : null,
                user instanceof com.example.Attendance_System_UoK.model.Student
                        ? ((com.example.Attendance_System_UoK.model.Student) user).getStudentId()
                        : null,
                user.getDepartment(),
                user instanceof com.example.Attendance_System_UoK.model.Student
                        ? ((com.example.Attendance_System_UoK.model.Student) user).getDegreeProgram()
                        : null,
                user.getFaculty(),
                user instanceof com.example.Attendance_System_UoK.model.Student
                        ? ((com.example.Attendance_System_UoK.model.Student) user).getArchivedCourseIds()
                        : null);
    }

    @Override
    public java.util.Map<String, Long> getDashboardStats() {
        long studentCount = studentRepository.count();
        long teacherCount = teacherRepository.countByActive(true);
        long courseCount = courseRepository.count();

        return java.util.Map.of(
                "students", studentCount,
                "teachers", teacherCount,
                "courses", courseCount);
    }
}
