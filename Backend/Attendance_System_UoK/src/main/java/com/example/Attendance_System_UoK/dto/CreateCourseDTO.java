package com.example.Attendance_System_UoK.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;



@Data
public class CreateCourseDTO {
    @NotBlank
    private String name;

    @NotBlank
    private String code;
}
