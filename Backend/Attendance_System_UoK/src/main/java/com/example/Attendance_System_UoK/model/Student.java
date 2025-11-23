package com.example.Attendance_System_UoK.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@Document(collection = "students")
public class Student extends User {

    private String studentId;
    private Integer batchYear;
    private String degreeProgram;

    private List<String> courseIds = new ArrayList<>();
}
