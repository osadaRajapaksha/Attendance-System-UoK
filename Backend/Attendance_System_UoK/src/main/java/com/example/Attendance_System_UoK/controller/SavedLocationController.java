package com.example.Attendance_System_UoK.controller;

import com.example.Attendance_System_UoK.model.SavedLocation;
import com.example.Attendance_System_UoK.service.SavedLocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
public class SavedLocationController {

    @Autowired
    private SavedLocationService savedLocationService;

    @GetMapping
    public ResponseEntity<List<SavedLocation>> getAllLocations() {
        return ResponseEntity.ok(savedLocationService.getAllLocations());
    }

    @PostMapping("/create")
    public ResponseEntity<SavedLocation> saveLocation(@RequestBody SavedLocation savedLocation) {
        return ResponseEntity.ok(savedLocationService.saveLocation(savedLocation));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLocation(@PathVariable String id) {
        savedLocationService.deleteLocation(id);
        return ResponseEntity.ok().build();
    }
}
