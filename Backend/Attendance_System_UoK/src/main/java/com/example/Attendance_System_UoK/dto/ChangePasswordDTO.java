package com.example.Attendance_System_UoK.dto;

import lombok.Data;

@Data
public class ChangePasswordDTO {
    private String oldPassword;
    private String newPassword;
    private String confirmNewPassword;
}
