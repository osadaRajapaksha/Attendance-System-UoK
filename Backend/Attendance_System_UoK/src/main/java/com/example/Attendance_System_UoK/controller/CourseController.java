package com.example.Attendance_System_UoK.controller;

import com.example.Attendance_System_UoK.dto.CreateCourseDTO;
import com.example.Attendance_System_UoK.model.Course;
import com.example.Attendance_System_UoK.model.Student;
import com.example.Attendance_System_UoK.model.Teacher;
import com.example.Attendance_System_UoK.repository.StudentRepository;
import com.example.Attendance_System_UoK.service.CourseService;
import com.example.Attendance_System_UoK.repository.TeacherRepository;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;

    public CourseController(CourseService courseService,
                            TeacherRepository teacherRepository, StudentRepository studentRepository) {
        this.courseService = courseService;
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
    }



    @PostMapping("/create")
    @PreAuthorize("hasRole('TEACHER')")
    public Course createCourse(@Valid @RequestBody CreateCourseDTO dto, Authentication authentication) {
        String username = authentication.getName();
        return courseService.createCourse(dto, username);
    }




    // Enroll student (can be done by student or admin or teacher)
    @PostMapping("/{courseId}/enroll")
    @PreAuthorize("hasAnyRole('STUDENT','ADMIN','TEACHER')")
    public Course enrollStudent(@PathVariable String courseId, Authentication authentication) {
        String username = authentication.getName();
        Optional<Student> student = studentRepository.findByUsername(username);
        String id = student.get().getId();
        return courseService.enrollStudent(courseId, id);
//        return id;
    }

    @GetMapping("/teacher")
    @PreAuthorize("hasRole('TEACHER')")
    public List<Course> getMyCourses(Principal principal) {
        // get teacher id by username
        Teacher teacher = teacherRepository.findAll()
                .stream()
                .filter(t -> t.getUsername().equals(principal.getName()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        return courseService.getCoursesByTeacher(teacher.getId());
    }
}
