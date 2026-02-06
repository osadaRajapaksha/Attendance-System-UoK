package com.example.Attendance_System_UoK.service;

import com.example.Attendance_System_UoK.dto.CourseBasicResponse;
import com.example.Attendance_System_UoK.dto.CreateCourseDTO;
import com.example.Attendance_System_UoK.model.Course;

import java.util.List;

public interface CourseService {
    Course createCourse(CreateCourseDTO dto, String username);

    Course enrollStudent(String courseId, String studentId, String enrollmentKey);

    void unenrollStudent(String courseId, String studentId);

    List<Course> getCoursesByTeacher(String teacherId);

    List<CourseBasicResponse> getAllCourses();

    List<CourseBasicResponse> getEnrolledCourses(String studentId);

    Course getCourseById(String courseId);

    List<com.example.Attendance_System_UoK.dto.StudentBasicInfo> getEnrolledStudents(String courseId);

    void deleteCourse(String courseId);

    Course createCourseForAdmin(CreateCourseDTO dto, String teacherId);
}
