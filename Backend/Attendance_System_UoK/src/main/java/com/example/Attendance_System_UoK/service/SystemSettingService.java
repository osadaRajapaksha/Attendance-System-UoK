package com.example.Attendance_System_UoK.service;

import com.example.Attendance_System_UoK.model.SystemSetting;
import com.example.Attendance_System_UoK.repository.SystemSettingRepository;
import org.springframework.stereotype.Service;

import java.time.ZoneId;

@Service
public class SystemSettingService {

    private final SystemSettingRepository repository;
    private static final String TIMEZONE_KEY = "TIMEZONE";
    private static final String DEFAULT_TIMEZONE = "Asia/Colombo";

    public SystemSettingService(SystemSettingRepository repository) {
        this.repository = repository;
    }

    public ZoneId getSystemTimezone() {
        return repository.findById(TIMEZONE_KEY)
                .map(setting -> {
                    try {
                        return ZoneId.of(setting.getValue());
                    } catch (Exception e) {
                        return ZoneId.of(DEFAULT_TIMEZONE);
                    }
                })
                .orElse(ZoneId.of(DEFAULT_TIMEZONE));
    }

    public String getCurrentTimezoneId() {
        return getSystemTimezone().getId();
    }

    public void updateSystemTimezone(String zoneId) {
        // Validate
        ZoneId.of(zoneId);
        repository.save(new SystemSetting(TIMEZONE_KEY, zoneId));
    }

    // New Settings
    private static final String ACADEMIC_YEAR_KEY = "ACADEMIC_YEAR";
    private static final String SEMESTER_KEY = "SEMESTER";
    private static final String ATTENDANCE_THRESHOLD_KEY = "ATTENDANCE_THRESHOLD";
    private static final String SESSION_DURATION_KEY = "SESSION_DURATION";

    public String getAcademicYear() {
        return repository.findById(ACADEMIC_YEAR_KEY).map(SystemSetting::getValue).orElse("2023/2024");
    }

    public void updateAcademicYear(String year) {
        repository.save(new SystemSetting(ACADEMIC_YEAR_KEY, year));
    }

    public String getSemester() {
        return repository.findById(SEMESTER_KEY).map(SystemSetting::getValue).orElse("Semester 1");
    }

    public void updateSemester(String semester) {
        repository.save(new SystemSetting(SEMESTER_KEY, semester));
    }

    public int getAttendanceThreshold() {
        return repository.findById(ATTENDANCE_THRESHOLD_KEY)
                .map(s -> Integer.parseInt(s.getValue()))
                .orElse(80);
    }

    public void updateAttendanceThreshold(int threshold) {
        repository.save(new SystemSetting(ATTENDANCE_THRESHOLD_KEY, String.valueOf(threshold)));
    }

    public int getSessionDuration() {
        return repository.findById(SESSION_DURATION_KEY)
                .map(s -> Integer.parseInt(s.getValue()))
                .orElse(60); // Default 60 mins
    }

    public void updateSessionDuration(int duration) {
        repository.save(new SystemSetting(SESSION_DURATION_KEY, String.valueOf(duration)));
    }
}
