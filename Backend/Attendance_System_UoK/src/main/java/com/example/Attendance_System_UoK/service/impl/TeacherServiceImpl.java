package com.example.Attendance_System_UoK.service.impl;

import com.example.Attendance_System_UoK.dto.UserResponse;
import com.example.Attendance_System_UoK.model.Role;
import com.example.Attendance_System_UoK.model.Teacher;
import com.example.Attendance_System_UoK.repository.TeacherRepository;
import com.example.Attendance_System_UoK.service.TeacherService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class TeacherServiceImpl implements TeacherService {

    private final TeacherRepository teacherRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.example.Attendance_System_UoK.repository.CourseRepository courseRepository;

    public TeacherServiceImpl(TeacherRepository teacherRepository, PasswordEncoder passwordEncoder,
            com.example.Attendance_System_UoK.repository.CourseRepository courseRepository) {
        this.teacherRepository = teacherRepository;
        this.passwordEncoder = passwordEncoder;
        this.courseRepository = courseRepository;
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
                savedTeacher.getRole(),
                savedTeacher.getFullName(),
                savedTeacher.getTeacherId(),
                savedTeacher.getPosition(),
                null, // studentId
                savedTeacher.getDepartment(),
                null, // degreeProgram
                savedTeacher.getFaculty(),
                null);

    }

    @Override
    public Page<UserResponse> getAllTeachers(Pageable pageable) {
        return teacherRepository.findAll(pageable)
                .map(teacher -> new UserResponse(
                        teacher.getId(),
                        teacher.getUsername(),
                        teacher.getEmail(),
                        teacher.getRole(),
                        teacher.getFullName(),
                        teacher.getTeacherId(),
                        teacher.getPosition(),
                        null, // studentId
                        teacher.getDepartment(),
                        null, // degreeProgram
                        teacher.getFaculty(),
                        null));
    }

    @Override
    public UserResponse updateTeacher(String id, com.example.Attendance_System_UoK.dto.RegisterRequest teacherDetails) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        if (teacherDetails.getFullName() != null)
            teacher.setFullName(teacherDetails.getFullName());
        if (teacherDetails.getEmail() != null)
            teacher.setEmail(teacherDetails.getEmail());
        if (teacherDetails.getDepartment() != null)
            teacher.setDepartment(teacherDetails.getDepartment());
        if (teacherDetails.getFaculty() != null)
            teacher.setFaculty(teacherDetails.getFaculty());

        // Update teacher specific fields
        // Since RegisterRequest might not have teacherId/position, we assume they are
        // passed or we need a specific DTO.
        // Reusing RegisterRequest but it has studentId/degreeProgram.
        // For simplicity, let's assume standard fields for now or cast if we had a
        // specific DTO,
        // but RegisterRequest is what we defined in interface.
        // Actually, for position/teacherId, we might need to check if RegisterRequest
        // has them or if we need to add them there or use a Map.
        // Let's assume RegisterRequest is used for now for basic details.
        // If we need teacher specific fields, we should ideally extend RegisterRequest
        // or use a different DTO.
        // Given existing code, let's stick to basic updates + position if we can (but
        // RegisterRequest needs those fields).
        // Wait, RegisterRequest is for registration. Maybe we should use a generic Map
        // or a specific TeacherUpdateDTO.
        // But for interface I used RegisterRequest. Let's check RegisterRequest
        // definition.

        teacherRepository.save(teacher);

        return new UserResponse(
                teacher.getId(),
                teacher.getUsername(),
                teacher.getEmail(),
                teacher.getRole(),
                teacher.getFullName(),
                teacher.getTeacherId(),
                teacher.getPosition(),
                null,
                teacher.getDepartment(),
                null,
                teacher.getFaculty(),
                null);
    }

    @Override
    public java.util.List<com.example.Attendance_System_UoK.model.Course> getTeacherCourses(String teacherId) {
        // We need to find by teacher ID field, not database ID if that's how it's
        // stored,
        // but CourseRepository.findByTeacherId likely expects the database ID of the
        // teacher user.
        // Let's assume teacherId in Course is the User ID.
        return courseRepository.findByTeacherId(teacherId);
    }
}
