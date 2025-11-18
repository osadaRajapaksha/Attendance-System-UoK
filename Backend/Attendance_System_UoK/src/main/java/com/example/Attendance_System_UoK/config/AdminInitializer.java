package com.example.Attendance_System_UoK.config;

import com.example.Attendance_System_UoK.model.Admin;
import com.example.Attendance_System_UoK.model.Role;
import com.example.Attendance_System_UoK.repository.AdminRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminInitializer {

    @Bean
    public CommandLineRunner initAdmin(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        return args -> {

            String adminEmail = "admin@kln.ac.lk";

            // Check if admin already exists
            if (adminRepository.findByEmail(adminEmail).isPresent()) {
                System.out.println("✔ Admin already exists");
                return;
            }

            // Create new admin
            Admin admin = new Admin();
            admin.setFullName("System Admin");
            admin.setEmail(adminEmail);
            admin.setUsername(adminEmail);
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setRole(Role.ROLE_ADMIN); // or Role.ROLE_ADMIN depending on enum
            admin.setActive(true);

            adminRepository.save(admin);

            System.out.println("✔ Default Admin Created:");
            System.out.println("Email: " + adminEmail);
            System.out.println("Password: Admin@123");
        };
    }
}
