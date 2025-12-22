package com.example.Attendance_System_UoK.controller;

import com.example.Attendance_System_UoK.service.SystemSettingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/system")
@CrossOrigin("*")
public class SystemController {

    private final SystemSettingService service;

    public SystemController(SystemSettingService service) {
        this.service = service;
    }

    @GetMapping("/timezone")
    public ResponseEntity<Map<String, String>> getTimezone() {
        return ResponseEntity.ok(Map.of("timezone", service.getCurrentTimezoneId()));
    }

    @PostMapping("/timezone")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> updateTimezone(@RequestBody Map<String, String> body) {
        String zoneId = body.get("timezone");
        service.updateSystemTimezone(zoneId);
        return ResponseEntity.ok().build();
    }
}
