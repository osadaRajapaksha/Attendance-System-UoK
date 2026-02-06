package com.example.Attendance_System_UoK.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentBasicInfo {
    private String id;
    private String fullName;
    private String studentId; // e.g., index number
    private LocalDateTime markedAt; // Optional, for attendance list
    private String deviceMismatchInfo; // Potential fraud indicator (Index Number)
}
