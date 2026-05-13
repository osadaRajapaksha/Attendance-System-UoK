package com.example.Attendance_System_UoK.service;

import com.example.Attendance_System_UoK.model.SavedLocation;

import java.util.List;

public interface SavedLocationService {
    SavedLocation saveLocation(SavedLocation savedLocation);
    List<SavedLocation> getAllLocations();
    void deleteLocation(String id);
}
