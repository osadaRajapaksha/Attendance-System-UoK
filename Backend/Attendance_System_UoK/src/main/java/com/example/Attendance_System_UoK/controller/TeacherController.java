package com.example.Attendance_System_UoK.controller;

import com.example.Attendance_System_UoK.dto.UserResponse;
import com.example.Attendance_System_UoK.model.Teacher;
import com.example.Attendance_System_UoK.service.TeacherService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import java.util.List;
import com.example.Attendance_System_UoK.model.Course;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/teachers")
public class TeacherController {

    private final TeacherService teacherService;

    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    // ADMIN only
    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> addTeacher(@RequestBody Teacher teacher) {
        return ResponseEntity.ok(teacherService.addTeacher(teacher));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserResponse>> getAllTeachers(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(teacherService.getAllTeachers(pageable));
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateTeacher(@PathVariable String id,
            @RequestBody com.example.Attendance_System_UoK.dto.RegisterRequest teacherDetails) {
        return ResponseEntity.ok(teacherService.updateTeacher(id, teacherDetails));
    }

    @GetMapping("/{id}/courses")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Course>> getTeacherCourses(@PathVariable String id) {
        return ResponseEntity.ok(teacherService.getTeacherCourses(id));
    }
}
