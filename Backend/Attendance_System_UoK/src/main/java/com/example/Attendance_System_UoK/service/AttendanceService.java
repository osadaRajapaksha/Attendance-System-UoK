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
    private final com.example.Attendance_System_UoK.repository.SessionRepository sessionRepository;

    public AttendanceService(AttendanceRepository attendanceRepository, StudentRepository studentRepository,
            com.example.Attendance_System_UoK.repository.SessionRepository sessionRepository) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
        this.sessionRepository = sessionRepository;
    }

    public List<StudentBasicInfo> getAttendanceBySessionId(String sessionId) {
        List<Attendance> attendances = attendanceRepository.findBySessionId(sessionId);

        return attendances.stream().map(att -> {
            Student student = studentRepository.findById(att.getStudentId()).orElse(null);
            if (student != null) {
                // Check if device owner is different (Fraud Check)
                String deviceMismatchInfo = null;
                if (att.getDeviceStudentId() != null && !att.getDeviceStudentId().equals(att.getStudentId())) {
                    Student owner = studentRepository.findById(att.getDeviceStudentId()).orElse(null);
                    if (owner != null) {
                        deviceMismatchInfo = owner.getStudentId(); // Use Index Number for display
                    }
                }

                return new StudentBasicInfo(student.getId(), student.getFullName(), student.getStudentId(),
                        att.getMarkedAt(), deviceMismatchInfo);
            }
            return new StudentBasicInfo(att.getStudentId(), "Unknown", "Unknown", att.getMarkedAt(), null);
        }).collect(Collectors.toList());
    }

    public List<com.example.Attendance_System_UoK.dto.AttendanceStatusDTO> getStudentAttendanceStatus(
            String studentId) {
        List<Attendance> attendances = attendanceRepository.findByStudentId(studentId);

        return attendances.stream().map(att -> {
            com.example.Attendance_System_UoK.model.Session session = sessionRepository.findById(att.getSessionId())
                    .orElse(null);
            int required = (session != null) ? session.getRequiredCheckIns() : 1;
            int count = (att.getCheckInTimes() != null) ? att.getCheckInTimes().size() : 1;
            boolean completed = count >= required;

            java.time.LocalDateTime nextAllowed = null;
            if (session != null && att.getCheckInTimes() != null && !att.getCheckInTimes().isEmpty()) {
                java.time.LocalDateTime last = att.getCheckInTimes().get(att.getCheckInTimes().size() - 1);
                nextAllowed = last.plusMinutes(session.getCheckInIntervalMinutes());
            }

            return new com.example.Attendance_System_UoK.dto.AttendanceStatusDTO(
                    att.getSessionId(),
                    count,
                    required,
                    att.getMarkedAt(),
                    completed,
                    nextAllowed,
                    att.getCheckInTimes());
        }).collect(Collectors.toList());
    }

    public void manualMarkAttendance(String sessionId, String studentId, String note) {
        Attendance attendance = attendanceRepository.findBySessionIdAndStudentId(sessionId, studentId)
                .orElse(new Attendance());

        if (attendance.getId() == null) {
            attendance.setSessionId(sessionId);
            attendance.setStudentId(studentId);
            attendance.setCheckInTimes(new java.util.ArrayList<>());
        }

        attendance.setManuallyMarked(true);
        attendance.setManualMarkNote(note);
        attendance.setStatus("PRESENT");
        attendance.setMarkedAt(java.time.LocalDateTime.now());

        if (attendance.getCheckInTimes() == null) {
            attendance.setCheckInTimes(new java.util.ArrayList<>());
        }
        // Add a timestamp for the manual mark if desired, or relying on
        // isManuallyMarked flag
        attendance.getCheckInTimes().add(java.time.LocalDateTime.now());

        attendanceRepository.save(attendance);
    }

    // Deprecate or remove getMarkedSessionIdsForStudent if not needed, or keep for
    // backward compat
    public List<String> getMarkedSessionIdsForStudent(String courseId, String studentId) {
        return attendanceRepository.findByStudentId(studentId).stream()
                .map(Attendance::getSessionId)
                .collect(Collectors.toList());
    }
}
