package com.example.Attendance_System_UoK.repository;

import com.example.Attendance_System_UoK.model.Teacher;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.Optional;

public interface TeacherRepository extends MongoRepository<Teacher, String> {
    Optional<Teacher> findByUsername(String username);


    @Query("{ 'username': ?0 }")
    @Update("{ '$set': { 'lastLogin': ?1 } }")
    void updateLastLogin(String username, LocalDateTime lastLogin);

}
