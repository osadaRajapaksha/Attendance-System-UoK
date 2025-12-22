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

    public UserService(StudentRepository studentRepository, TeacherRepository teacherRepository,
            AdminRepository adminRepository) {
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.adminRepository = adminRepository;
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

    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole());
    }
}