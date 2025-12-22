package com.example.Attendance_System_UoK.repository;

import com.example.Attendance_System_UoK.model.Attendance;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends MongoRepository<Attendance, String> {
    List<Attendance> findBySessionId(String sessionId);

    List<Attendance> findByStudentId(String studentId);

    Optional<Attendance> findBySessionIdAndStudentId(String sessionId, String studentId);
}
