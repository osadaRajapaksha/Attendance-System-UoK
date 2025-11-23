package com.example.Attendance_System_UoK.service;

import com.example.Attendance_System_UoK.dto.CreateCourseDTO;
import com.example.Attendance_System_UoK.model.Course;

import java.util.List;

public interface CourseService {
    Course createCourse(CreateCourseDTO dto, String username);
    Course enrollStudent(String courseId, String studentId);
    List<Course> getCoursesByTeacher(String teacherId);
}
