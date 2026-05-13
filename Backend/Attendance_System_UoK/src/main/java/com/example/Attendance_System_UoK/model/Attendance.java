package com.example.Attendance_System_UoK.model;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "attendances")
@AllArgsConstructor
@NoArgsConstructor
public class Attendance {
    @Id
    private String id;
    private String sessionId;
    private String courseId; // Denormalized for query performance
    private String studentId;
    private LocalDateTime markedAt; // Keep for backward compatibility/last marked time
    private List<LocalDateTime> checkInTimes;
    private String status; // "PRESENT"

    // Manual Marking
    private boolean isManuallyMarked;
    private String manualMarkNote;

    // Anti-Fraud
    private String deviceStudentId; // ID of the student whose device token was used
}
