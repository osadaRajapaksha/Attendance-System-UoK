package com.example.Attendance_System_UoK.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "courses")
public class Course {
    @Id
    private String id;

    private String name;
    private String code;
    private String teacherId;        // owner (Teacher.id)
    private List<String> studentIds = new ArrayList<>(); // enrolled student ids
}
