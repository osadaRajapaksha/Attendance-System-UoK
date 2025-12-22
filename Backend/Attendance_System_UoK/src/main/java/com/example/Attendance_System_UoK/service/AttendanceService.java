package com.example.Attendance_System_UoK.service;

import com.example.Attendance_System_UoK.dto.StudentBasicInfo;
import com.example.Attendance_System_UoK.model.Attendance;
import com.example.Attendance_System_UoK.model.Student;
import com.example.Attendance_System_UoK.repository.AttendanceRepository;
import com.example.Attendance_System_UoK.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;

    public AttendanceService(AttendanceRepository attendanceRepository, StudentRepository studentRepository) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
    }

    public List<StudentBasicInfo> getAttendanceBySessionId(String sessionId) {
        List<Attendance> attendances = attendanceRepository.findBySessionId(sessionId);

        return attendances.stream().map(att -> {
            Student student = studentRepository.findById(att.getStudentId()).orElse(null);
            if (student != null) {
                return new StudentBasicInfo(student.getId(), student.getFullName(), student.getStudentId(),
                        att.getMarkedAt());
            }
            return new StudentBasicInfo(att.getStudentId(), "Unknown", "Unknown", att.getMarkedAt());
        }).collect(Collectors.toList());
    }

    public List<String> getMarkedSessionIdsForStudent(String courseId, String studentId) {
        // Ideally filter by courseId sessions first to optimize, but given current
        // repos:
        // We can fetch all attendance for student, then filter conceptually by course
        // sessions
        // Or if we trust the Student knows their course context.
        // Actually, fetching all student attendance is fine, then frontend matches with
        // visible sessions.
        // Or we pass Session IDs.
        // Let's just return ALL marked session IDs for the student.
        return attendanceRepository.findByStudentId(studentId).stream()
                .map(Attendance::getSessionId)
                .collect(Collectors.toList());
    }
}
