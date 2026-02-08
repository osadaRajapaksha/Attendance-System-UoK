package com.example.Attendance_System_UoK.service;

import com.example.Attendance_System_UoK.dto.UserResponse;
import com.example.Attendance_System_UoK.model.User;

public interface UserService {
    UserResponse getUserByUsername(String username);

    void changePassword(String username, com.example.Attendance_System_UoK.dto.ChangePasswordDTO dto);

    java.util.Optional<User> findUserByEmail(String email);

    void saveUser(User user);
}