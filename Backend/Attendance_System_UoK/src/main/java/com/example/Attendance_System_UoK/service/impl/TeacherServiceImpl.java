package com.example.Attendance_System_UoK.service.impl;

import com.example.Attendance_System_UoK.dto.UserResponse;
import com.example.Attendance_System_UoK.model.Role;
import com.example.Attendance_System_UoK.model.Teacher;
import com.example.Attendance_System_UoK.repository.TeacherRepository;
import com.example.Attendance_System_UoK.service.TeacherService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class TeacherServiceImpl implements TeacherService {

    private final TeacherRepository teacherRepository;
    private final PasswordEncoder passwordEncoder;

    public TeacherServiceImpl(TeacherRepository teacherRepository, PasswordEncoder passwordEncoder) {
        this.teacherRepository = teacherRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserResponse addTeacher(Teacher teacher) {
        // Set required fields that User expects
        teacher.setUsername(teacher.getUsername());
        teacher.setPassword(passwordEncoder.encode(teacher.getPassword()));
        teacher.setRole(Role.ROLE_TEACHER);
        teacher.setCreatedAt(LocalDateTime.now());
        teacher.setUpdatedAt(LocalDateTime.now());

         Teacher savedTeacher = teacherRepository.save(teacher);

         return new UserResponse(
                 savedTeacher.getId(),
                 savedTeacher.getUsername(),
                 savedTeacher.getEmail(),
                 savedTeacher.getRole()

         );


    }
}
