package com.example.Attendance_System_UoK.service;

import com.example.Attendance_System_UoK.dto.MarkAttendanceRequest;
import com.example.Attendance_System_UoK.dto.SessionRequest;
import com.example.Attendance_System_UoK.dto.SessionUpdateRequest;
import com.example.Attendance_System_UoK.model.Attendance;
import com.example.Attendance_System_UoK.model.Session;
import com.example.Attendance_System_UoK.model.GeoPoint;
import com.example.Attendance_System_UoK.model.SessionStatus;
import com.example.Attendance_System_UoK.repository.AttendanceRepository;
import com.example.Attendance_System_UoK.repository.SessionRepository;
import com.example.Attendance_System_UoK.repository.CourseRepository;
import com.example.Attendance_System_UoK.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SessionService {

    private final SessionRepository sessionRepository;
    private final AttendanceRepository attendanceRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final SystemSettingService systemSettingService;
    private final com.example.Attendance_System_UoK.util.DeviceTokenUtil deviceTokenUtil;

    public SessionService(SessionRepository sessionRepository, AttendanceRepository attendanceRepository,
            CourseRepository courseRepository, StudentRepository studentRepository,
            SystemSettingService systemSettingService,
            com.example.Attendance_System_UoK.util.DeviceTokenUtil deviceTokenUtil) {
        this.sessionRepository = sessionRepository;
        this.attendanceRepository = attendanceRepository;
        this.courseRepository = courseRepository;
        this.studentRepository = studentRepository;
        this.systemSettingService = systemSettingService;
        this.deviceTokenUtil = deviceTokenUtil;
    }

    @Transactional
    public List<Session> createSessions(SessionRequest request, String teacherId) {
        List<Session> createdSessions = new ArrayList<>();

        // Always create the first one
        Session session = new Session();
        session.setCourseId(request.getCourseId());
        session.setTeacherId(teacherId);
        session.setTitle(request.getTitle());
        session.setStartTime(request.getStartTime());
        session.setEndTime(request.getEndTime());
        session.setBoundary(request.getBoundary());

        long durationMinutes = java.time.Duration.between(request.getStartTime(), request.getEndTime()).toMinutes();
        if (request.getCheckInIntervalMinutes() >= durationMinutes) {
            throw new IllegalArgumentException("Check-in interval must be less than session duration.");
        }

        session.setRequiredCheckIns(request.getRequiredCheckIns() > 0 ? request.getRequiredCheckIns() : 1);
        session.setCheckInIntervalMinutes(request.getCheckInIntervalMinutes());
        updateSessionStatus(session);

        createdSessions.add(sessionRepository.save(session));

        if (request.isWeekly()) {
            LocalDateTime nextStart = request.getStartTime().plusWeeks(1);
            LocalDateTime nextEnd = request.getEndTime().plusWeeks(1);
            LocalDateTime limitDate = request.getRecurrenceEndDate() != null
                    ? request.getRecurrenceEndDate()
                    : request.getStartTime().plusWeeks(12); // Fallback to 12 weeks if null

            int weekCount = 2;
            while (!nextStart.isAfter(limitDate)) {
                Session nextSession = new Session();
                nextSession.setCourseId(request.getCourseId());
                nextSession.setTeacherId(teacherId);
                nextSession.setTitle(request.getTitle() + " (Week " + weekCount + ")");
                nextSession.setStartTime(nextStart);
                nextSession.setEndTime(nextEnd);
                nextSession.setBoundary(request.getBoundary());
                nextSession.setRequiredCheckIns(session.getRequiredCheckIns());
                nextSession.setCheckInIntervalMinutes(session.getCheckInIntervalMinutes());
                updateSessionStatus(nextSession);
                createdSessions.add(sessionRepository.save(nextSession));

                weekCount++;
                nextStart = nextStart.plusWeeks(1);
                nextEnd = nextEnd.plusWeeks(1);
            }
        }

        return createdSessions;
    }

    public List<Session> getAllSessions() {
        return sessionRepository.findAll();
    }

    public List<Session> getTeacherSessions(String teacherId) {
        return sessionRepository.findByTeacherId(teacherId);
    }

    public List<Session> getSessionsByCourseId(String courseId) {
        List<Session> sessions = sessionRepository.findByCourseId(courseId);
        sessions.forEach(this::updateSessionStatus);
        return sessions;
    }

    public List<Session> getStudentSessions(String studentId) {
        var student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        List<String> courseIds = student.getCourseIds();

        List<Session> allSessions = new ArrayList<>();
        if (courseIds != null) {
            for (String courseId : courseIds) {
                allSessions.addAll(sessionRepository.findByCourseId(courseId));
            }
        }
        return allSessions;
    }

    public Attendance markAttendance(String loggedInStudentId, MarkAttendanceRequest request) {
        Session session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));

        // 1. Check if session is Active
        updateSessionStatus(session); // Ensure status is current
        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Session is not active. Status: " + session.getStatus());
        }

        // Anti-Fraud: Device Lock Check
        String deviceOwnerId = null;
        if (request.getDeviceToken() != null && !request.getDeviceToken().isEmpty()) {
            deviceOwnerId = deviceTokenUtil.decrypt(request.getDeviceToken());
        }

        // Anti-Fraud: Check for mismatch
        boolean isFraud = false;
        if (deviceOwnerId != null && !deviceOwnerId.equals(loggedInStudentId)) {
            isFraud = true;
            // We do NOT throw exception anymore. We log it.
        }

        String studentId = loggedInStudentId;

        // 2. Retrieve existing attendance or create new
        Attendance attendance = attendanceRepository.findBySessionIdAndStudentId(session.getId(), studentId)
                .orElse(null);

        // 3. Check Location
        if (!isPointInPolygon(new GeoPoint(request.getLat(), request.getLng()), session.getBoundary())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "You are not within the session boundary. Please move closer to the class.");
        }

        LocalDateTime now = LocalDateTime.now(systemSettingService.getSystemTimezone());

        if (attendance == null) {
            // First Check-in
            attendance = new Attendance();
            attendance.setSessionId(session.getId());
            attendance.setStudentId(studentId);
            attendance.setDeviceStudentId(deviceOwnerId); // Log the device owner
            attendance.setCheckInTimes(new java.util.ArrayList<>(java.util.Collections.singletonList(now)));
            attendance.setMarkedAt(now);

            if (isFraud) {
                attendance.setStatus("FRAUD");
            } else if (session.getRequiredCheckIns() <= 1) {
                attendance.setStatus("PRESENT");
            } else {
                attendance.setStatus("IN_PROGRESS");
            }
        } else {
            // Subsequent Check-in
            if (isFraud) {
                attendance.setStatus("FRAUD");
            }

            if (attendance.getCheckInTimes() == null) {
                attendance.setCheckInTimes(new java.util.ArrayList<>());
            }

            // Check if already completed
            if (attendance.getCheckInTimes().size() >= session.getRequiredCheckIns()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "You have already completed all required check-ins.");
            }

            // Check Interval
            if (!attendance.getCheckInTimes().isEmpty()) {
                LocalDateTime lastCheckIn = attendance.getCheckInTimes().get(attendance.getCheckInTimes().size() - 1);
                long minutesExceeded = java.time.Duration.between(lastCheckIn, now).toMinutes();
                if (minutesExceeded < session.getCheckInIntervalMinutes()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Please wait " + (session.getCheckInIntervalMinutes() - minutesExceeded)
                                    + " more minutes before next check-in.");
                }
            }

            attendance.getCheckInTimes().add(now);
            attendance.setMarkedAt(now);

            // Update status only if not already FRAUD
            if (!"FRAUD".equals(attendance.getStatus())) {
                if (attendance.getCheckInTimes().size() >= session.getRequiredCheckIns()) {
                    attendance.setStatus("PRESENT");
                }
            }
        }

        return attendanceRepository.save(attendance);

    }

    // Duplicate block removed

    public Session updateSession(String sessionId, SessionUpdateRequest request) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));

        if (request.getTitle() != null && !request.getTitle().isEmpty()) {
            session.setTitle(request.getTitle());
        }
        if (request.getStartTime() != null) {
            session.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            session.setEndTime(request.getEndTime());
        }
        if (request.getBoundary() != null && !request.getBoundary().isEmpty()) {
            session.setBoundary(request.getBoundary());
        }

        // Re-evaluate status in case times changed
        updateSessionStatus(session);

        return sessionRepository.save(session);
    }

    public void deleteSession(String sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));

        if (session.getStatus() != SessionStatus.SCHEDULED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot delete session. Only SCHEDULED sessions can be deleted. Current status: "
                            + session.getStatus());
        }

        session.setStatus(SessionStatus.DELETED);
        sessionRepository.save(session);
    }

    // Check status based on time
    private void updateSessionStatus(Session session) {
        if (session.getStatus() == SessionStatus.DELETED) {
            return;
        }

        LocalDateTime now = LocalDateTime.now(systemSettingService.getSystemTimezone());
        if (now.isBefore(session.getStartTime())) {
            session.setStatus(SessionStatus.SCHEDULED);
        } else if (now.isAfter(session.getEndTime())) {
            session.setStatus(SessionStatus.EXPIRED);
        } else {
            session.setStatus(SessionStatus.ACTIVE);
        }
        sessionRepository.save(session);
    }

    // Ray Casting Algorithm
    private boolean isPointInPolygon(GeoPoint point, List<GeoPoint> polygon) {
        int i, j;
        boolean c = false;
        for (i = 0, j = polygon.size() - 1; i < polygon.size(); j = i++) {
            if (((polygon.get(i).getLng() > point.getLng()) != (polygon.get(j).getLng() > point.getLng())) &&
                    (point.getLat() < (polygon.get(j).getLat() - polygon.get(i).getLat())
                            * (point.getLng() - polygon.get(i).getLng())
                            / (polygon.get(j).getLng() - polygon.get(i).getLng()) + polygon.get(i).getLat())) {
                c = !c;
            }
        }
        return c;
    }
}