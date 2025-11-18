package com.example.Attendance_System_UoK.repository;

import com.example.Attendance_System_UoK.model.Admin;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.Optional;

public interface AdminRepository extends MongoRepository<Admin, String> {
    Optional<Admin> findByUsername(String username);

    Optional<Object> findByEmail(String adminEmail);

    @Query("{ 'username': ?0 }")
    @Update("{ '$set': { 'lastLogin': ?1 } }")
    void updateLastLogin(String username, LocalDateTime lastLogin);

}
