package com.yourprojectname.controller;

import com.yourprojectname.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // Test API
    @GetMapping("/test")
    public String testAdmin() {
        return "Admin API is working";
    }

    // Admin Dashboard API
    @GetMapping("/dashboard")
    public String getDashboard() {
        return adminService.getAdminDashboardMessage();
    }

    // Admin Login API
    @PostMapping("/login")
    public String adminLogin(
            @RequestParam String username,
            @RequestParam String password) {
        return adminService.loginAdmin(username, password);
    }
}
