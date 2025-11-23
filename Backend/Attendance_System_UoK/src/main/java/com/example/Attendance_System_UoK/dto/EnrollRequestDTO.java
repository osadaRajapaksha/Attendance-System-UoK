package com.example.Attendance_System_UoK.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;



@Data
public class EnrollRequestDTO {
    @NotBlank
    private String studentId;
}
