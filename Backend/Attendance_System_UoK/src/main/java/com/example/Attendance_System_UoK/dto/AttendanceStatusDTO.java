package com.example.Attendance_System_UoK.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AttendanceStatusDTO {
    private String sessionId;
    private int checkInCount;
    private int requiredCheckIns;
    private LocalDateTime lastCheckIn;
    private boolean completed;

    private LocalDateTime nextAllowedCheckIn;
    private java.util.List<LocalDateTime> checkInLogs;
}
