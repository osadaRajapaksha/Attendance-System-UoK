package com.example.Attendance_System_UoK.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequest {
    private String email;
    private String username;
    private String password;


    public String getUsername() {
        return this.email;
    }
}





