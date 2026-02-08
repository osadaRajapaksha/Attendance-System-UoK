package com.example.Attendance_System_UoK.service;

import com.example.Attendance_System_UoK.dto.MarkAttendanceRequest;
import com.example.Attendance_System_UoK.dto.SessionRequest;
import com.example.Attendance_System_UoK.dto.SessionUpdateRequest;
import com.example.Attendance_System_UoK.model.Attendance;
import com.example.Attendance_System_UoK.model.Session;
import java.util.List;

public interface SessionService {
    List<Session> createSessions(SessionRequest request, String teacherId);

    List<Session> getAllSessions();

    List<Session> getTeacherSessions(String teacherId);

    List<Session> getSessionsByCourseId(String courseId);

    List<Session> getStudentSessions(String studentId);

    Attendance markAttendance(String loggedInStudentId, MarkAttendanceRequest request);

    Session updateSession(String sessionId, SessionUpdateRequest request);

    void deleteSession(String sessionId);
}