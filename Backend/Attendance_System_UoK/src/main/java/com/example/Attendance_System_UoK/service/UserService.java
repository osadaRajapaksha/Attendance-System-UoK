package com.example.Attendance_System_UoK.service;

import com.example.Attendance_System_UoK.dto.UserResponse;
import com.example.Attendance_System_UoK.model.User;
import com.example.Attendance_System_UoK.model.Student;
import com.example.Attendance_System_UoK.model.Teacher;
import com.example.Attendance_System_UoK.model.Admin;
import com.example.Attendance_System_UoK.repository.StudentRepository;
import com.example.Attendance_System_UoK.repository.TeacherRepository;
import com.example.Attendance_System_UoK.repository.AdminRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final AdminRepository adminRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public UserService(StudentRepository studentRepository, TeacherRepository teacherRepository,
            AdminRepository adminRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse getUserByUsername(String username) {
        User user = studentRepository.findByUsername(username)
                .map(u -> (User) u)
                .orElseGet(() -> teacherRepository.findByUsername(username)
                        .map(u -> (User) u)
                        .orElseGet(() -> adminRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"))));

        return mapToUserResponse(user);
    }

    public void changePassword(String username, com.example.Attendance_System_UoK.dto.ChangePasswordDTO dto) {
        User user = studentRepository.findByUsername(username)
                .map(u -> (User) u)
                .orElseGet(() -> teacherRepository.findByUsername(username)
                        .map(u -> (User) u)
                        .orElseGet(() -> adminRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"))));

        if (!passwordEncoder.matches(dto.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid old password");
        }

        if (dto.getConfirmNewPassword() == null || !dto.getNewPassword().equals(dto.getConfirmNewPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));

        if (user instanceof Student) {
            studentRepository.save((Student) user);
        } else if (user instanceof Teacher) {
            teacherRepository.save((Teacher) user);
        } else if (user instanceof Admin) {
            adminRepository.save((Admin) user);
        }
    }

    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getFullName(),
                user instanceof Teacher ? ((Teacher) user).getTeacherId() : null,
                user instanceof Teacher ? ((Teacher) user).getPosition() : null,
                user instanceof Student ? ((Student) user).getStudentId() : null,
                user.getDepartment(),
                user instanceof Student ? ((Student) user).getDegreeProgram() : null,
                user.getFaculty(),
                user instanceof Student ? ((Student) user).getArchivedCourseIds() : null);
    }

    public java.util.Optional<User> findUserByEmail(String email) {
        java.util.Optional<Student> student = studentRepository.findByEmail(email);
        if (student.isPresent()) {
            return java.util.Optional.of(student.get());
        }

        java.util.Optional<Teacher> teacher = teacherRepository.findByEmail(email);
        if (teacher.isPresent()) {
            return java.util.Optional.of(teacher.get());
        }

        java.util.Optional<Admin> admin = adminRepository.findByEmail(email);
        if (admin.isPresent()) {
            return java.util.Optional.of(admin.get());
        }

        return java.util.Optional.empty();
    }

    public void saveUser(User user) {
        if (user instanceof Student) {
            studentRepository.save((Student) user);
        } else if (user instanceof Teacher) {
            teacherRepository.save((Teacher) user);
        } else if (user instanceof Admin) {
            adminRepository.save((Admin) user);
        } else {
            throw new RuntimeException("Unknown user type");
        }
    }
}