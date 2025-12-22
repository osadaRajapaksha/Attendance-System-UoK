package com.example.Attendance_System_UoK.repository;

import com.example.Attendance_System_UoK.model.Session;
import com.example.Attendance_System_UoK.model.SessionStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface SessionRepository extends MongoRepository<Session, String> {
    List<Session> findByTeacherId(String teacherId);

    List<Session> findByCourseId(String courseId);

    List<Session> findByStatus(SessionStatus status);
}
