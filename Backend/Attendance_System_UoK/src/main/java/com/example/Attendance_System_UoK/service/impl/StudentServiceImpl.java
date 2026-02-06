package com.example.Attendance_System_UoK.service.impl;

import com.example.Attendance_System_UoK.dto.UserResponse;
import com.example.Attendance_System_UoK.model.User;
import com.example.Attendance_System_UoK.repository.StudentRepository;
import com.example.Attendance_System_UoK.service.StudentService;
import org.springframework.stereotype.Service;

@Service
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;

    public StudentServiceImpl(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Override
    public UserResponse getStudentByUsername(String username) {
        User user = studentRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToUserResponse(user);
    }

    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getFullName(),
                user instanceof com.example.Attendance_System_UoK.model.Student
                        ? ((com.example.Attendance_System_UoK.model.Student) user).getStudentId()
                        : null,
                user instanceof com.example.Attendance_System_UoK.model.Student
                        ? ((com.example.Attendance_System_UoK.model.Student) user).getDegreeProgram()
                        : null,
                user.getFaculty());
    }
}
