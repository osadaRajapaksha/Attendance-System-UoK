package com.example.Attendance_System_UoK.repository;

import com.example.Attendance_System_UoK.model.Course;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CourseRepository extends MongoRepository<Course, String> {
    List<Course> findByTeacherId(String teacherId);
}
