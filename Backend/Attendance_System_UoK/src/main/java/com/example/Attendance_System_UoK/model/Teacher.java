package com.example.Attendance_System_UoK.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@EqualsAndHashCode(callSuper = true)
@Document(collection = "teachers")
public class Teacher extends User {

    private String teacherId;
    private String position;
}
