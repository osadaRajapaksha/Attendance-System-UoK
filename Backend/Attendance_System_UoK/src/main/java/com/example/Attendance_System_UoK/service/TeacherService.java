package com.example.Attendance_System_UoK.service;

import com.example.Attendance_System_UoK.dto.UserResponse;
import com.example.Attendance_System_UoK.model.Teacher;

public interface TeacherService {
    UserResponse addTeacher(Teacher teacher);

    org.springframework.data.domain.Page<UserResponse> getAllTeachers(
            org.springframework.data.domain.Pageable pageable);

    UserResponse updateTeacher(String id, com.example.Attendance_System_UoK.dto.RegisterRequest teacherDetails);

    java.util.List<com.example.Attendance_System_UoK.model.Course> getTeacherCourses(String teacherId);
}
