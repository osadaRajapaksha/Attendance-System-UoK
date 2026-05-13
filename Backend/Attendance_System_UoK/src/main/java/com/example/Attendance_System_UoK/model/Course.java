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
    private String teacherId; // Legacy field for existing data
    private List<String> teacherIds = new ArrayList<>(); // owners (Teacher.id)

    public List<String> getTeacherIds() {
        if (teacherIds == null) {
            teacherIds = new ArrayList<>();
        }
        if (teacherIds.isEmpty() && teacherId != null) {
            teacherIds.add(teacherId);
        }
        return teacherIds;
    }
    private String enrollmentKey;
    private List<String> studentIds = new ArrayList<>(); // enrolled student ids

    private boolean isArchived = false;

    private String academicYear;
    private String semester;
}
