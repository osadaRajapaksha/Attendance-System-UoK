package com.example.Attendance_System_UoK.service;

import com.example.Attendance_System_UoK.dto.UserResponse;
import com.example.Attendance_System_UoK.model.Teacher;

public interface TeacherService {
    UserResponse addTeacher(Teacher teacher);
}
