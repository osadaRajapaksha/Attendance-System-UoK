package com.example.Attendance_System_UoK.model;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "sessions")
@AllArgsConstructor
@NoArgsConstructor
public class Session {
    @Id
    private String id;
    private String courseId;
    private String teacherId;
    private String title;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    // List of 4 coordinates: [{lat, lng}, ...]
    private List<GeoPoint> boundary;

    // Check-in configuration
    private int requiredCheckIns; // Default 1
    private int checkInIntervalMinutes; // Default 0

    private SessionStatus status;
}
