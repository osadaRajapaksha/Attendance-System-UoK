package com.example.Attendance_System_UoK.security;

import com.example.Attendance_System_UoK.model.Admin;
import com.example.Attendance_System_UoK.model.Student;
import com.example.Attendance_System_UoK.model.Teacher;
import com.example.Attendance_System_UoK.model.User;
import com.example.Attendance_System_UoK.repository.AdminRepository;
import com.example.Attendance_System_UoK.repository.StudentRepository;
import com.example.Attendance_System_UoK.repository.TeacherRepository;
import com.example.Attendance_System_UoK.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final AdminRepository adminRepository;

    public CustomUserDetailsService(
            UserRepository userRepository,
            StudentRepository studentRepository,
            TeacherRepository teacherRepository,
            AdminRepository adminRepository
    ) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.adminRepository = adminRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        // 2. Search Student
        Student student = studentRepository.findByUsername(username).orElse(null);
        if (student != null)
            return student;

        // 1. Search User (generic)
        User user = userRepository.findByUsername(username).orElse(null);
        if (user != null)
            return user;



        // 3. Search Teacher
        Teacher teacher = teacherRepository.findByUsername(username).orElse(null);
        if (teacher != null)
            return teacher;

        // 4. Search Admin
        Admin admin = adminRepository.findByUsername(username).orElse(null);
        if (admin != null)
            return admin;

        throw new UsernameNotFoundException("User not found: " + username);
    }
}
