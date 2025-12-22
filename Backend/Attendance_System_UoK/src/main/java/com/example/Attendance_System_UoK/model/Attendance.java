package com.example.Attendance_System_UoK.model;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "attendances")
@AllArgsConstructor
@NoArgsConstructor
public class Attendance {
    @Id
    private String id;
    private String sessionId;
    private String studentId;
    private LocalDateTime markedAt;
    private String status; // "PRESENT"
}
