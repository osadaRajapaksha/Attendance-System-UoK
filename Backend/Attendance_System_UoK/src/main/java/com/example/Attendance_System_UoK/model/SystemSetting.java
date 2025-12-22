package com.example.Attendance_System_UoK.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "system_settings")
public class SystemSetting {
    @Id
    private String key; // e.g. "TIMEZONE"
    private String value;
}
