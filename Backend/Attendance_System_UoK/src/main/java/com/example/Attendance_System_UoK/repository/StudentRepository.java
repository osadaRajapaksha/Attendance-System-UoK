package com.example.Attendance_System_UoK.repository;

import com.example.Attendance_System_UoK.model.Student;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.Optional;

public interface StudentRepository extends MongoRepository<Student, String> {
    Optional<Student> findByUsername(String username);

    Optional<Object> findByEmail(String email);

    @Query("{ 'username': ?0 }")
    @Update("{ '$set': { 'lastLogin': ?1 } }")
    void updateLastLogin(String username, LocalDateTime lastLogin);

}
