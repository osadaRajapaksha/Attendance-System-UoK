package com.example.Attendance_System_UoK.controller;

import com.example.Attendance_System_UoK.dto.StudentBasicInfo;
import com.example.Attendance_System_UoK.dto.UserResponse;
import com.example.Attendance_System_UoK.service.AttendanceService;
import com.example.Attendance_System_UoK.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin("*")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final UserService userService;

    public AttendanceController(AttendanceService attendanceService, UserService userService) {
        this.attendanceService = attendanceService;
        this.userService = userService;
    }

    @GetMapping("/session/{sessionId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<StudentBasicInfo>> getSessionAttendance(@PathVariable String sessionId) {
        return ResponseEntity.ok(attendanceService.getAttendanceBySessionId(sessionId));
    }

    @GetMapping("/student/marked")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<String>> getMyMarkedSessions(Authentication authentication) {
        String username = authentication.getName();
        UserResponse user = userService.getUserByUsername(username);
        // We can pass courseId if we want to filter, but returning all is okay for now
        return ResponseEntity.ok(attendanceService.getMarkedSessionIdsForStudent(null, user.getId()));
    }
}
