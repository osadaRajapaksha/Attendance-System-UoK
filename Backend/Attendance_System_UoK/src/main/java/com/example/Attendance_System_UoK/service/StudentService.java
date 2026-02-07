package com.example.Attendance_System_UoK.service;

import com.example.Attendance_System_UoK.dto.UserResponse;

public interface StudentService {
    UserResponse getStudentByUsername(String username);

    org.springframework.data.domain.Page<UserResponse> getAllStudents(
            org.springframework.data.domain.Pageable pageable);

    UserResponse updateStudent(String id, com.example.Attendance_System_UoK.dto.RegisterRequest studentDetails);

    java.util.List<com.example.Attendance_System_UoK.model.Course> getStudentCourses(String studentId);

    void archiveCourse(String username, String courseId);

    void unarchiveCourse(String username, String courseId);
}
