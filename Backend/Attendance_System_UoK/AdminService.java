package com.yourprojectname.service;

import org.springframework.stereotype.Service;

@Service
public class AdminService {

    public String getAdminDashboardMessage() {
        return "Welcome to Admin Dashboard";
    }

    public String loginAdmin(String username, String password) {
        // Dummy logic (for demo / academic purpose)
        if (username.equals("admin") && password.equals("admin123")) {
            return "Admin login successful";
        } else {
            return "Invalid admin credentials";
        }
    }
}
