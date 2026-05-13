package com.example.Attendance_System_UoK.service.impl;

import com.example.Attendance_System_UoK.model.SavedLocation;
import com.example.Attendance_System_UoK.repository.SavedLocationRepository;
import com.example.Attendance_System_UoK.service.SavedLocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SavedLocationServiceImpl implements SavedLocationService {

    @Autowired
    private SavedLocationRepository savedLocationRepository;

    @Override
    public SavedLocation saveLocation(SavedLocation savedLocation) {
        return savedLocationRepository.save(savedLocation);
    }

    @Override
    public List<SavedLocation> getAllLocations() {
        return savedLocationRepository.findAll();
    }

    @Override
    public void deleteLocation(String id) {
        savedLocationRepository.deleteById(id);
    }
}
