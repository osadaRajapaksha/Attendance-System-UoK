package com.example.Attendance_System_UoK.repository;

import com.example.Attendance_System_UoK.model.SavedLocation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SavedLocationRepository extends MongoRepository<SavedLocation, String> {
}
