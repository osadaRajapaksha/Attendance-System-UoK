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
}
