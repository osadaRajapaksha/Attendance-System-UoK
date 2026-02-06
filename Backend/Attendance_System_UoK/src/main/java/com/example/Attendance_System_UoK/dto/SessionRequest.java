package com.example.Attendance_System_UoK.dto;

import com.example.Attendance_System_UoK.model.GeoPoint;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class SessionRequest {
    private String courseId;
    private String title;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private List<GeoPoint> boundary;
    private boolean weekly;
    private LocalDateTime recurrenceEndDate;
    private int requiredCheckIns;
    private int checkInIntervalMinutes;
}
