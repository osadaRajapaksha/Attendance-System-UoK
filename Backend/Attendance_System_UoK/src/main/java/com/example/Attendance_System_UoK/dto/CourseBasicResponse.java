package com.example.Attendance_System_UoK.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CourseBasicResponse {

    private String id;
    private String name;
    private String code;
    private String teacherName;
    private boolean hasEnrollmentKey;
    private String academicYear;
    private String semester;
}
