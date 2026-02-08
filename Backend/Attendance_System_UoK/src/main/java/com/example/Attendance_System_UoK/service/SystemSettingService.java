package com.example.Attendance_System_UoK.service;

import java.time.ZoneId;

public interface SystemSettingService {
    ZoneId getSystemTimezone();

    String getCurrentTimezoneId();

    void updateSystemTimezone(String zoneId);

    String getAcademicYear();

    void updateAcademicYear(String year);

    String getSemester();

    void updateSemester(String semester);

    int getAttendanceThreshold();

    void updateAttendanceThreshold(int threshold);

    int getSessionDuration();

    void updateSessionDuration(int duration);
}
