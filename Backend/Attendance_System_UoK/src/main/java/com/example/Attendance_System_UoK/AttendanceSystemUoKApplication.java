package com.example.Attendance_System_UoK;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AttendanceSystemUoKApplication {

	public static void main(String[] args) {
		System.setProperty("java.net.preferIPv4Stack", "true");
		System.setProperty("jdk.tls.client.protocols", "TLSv1.2"); // Force TLS 1.2

		SpringApplication.run(AttendanceSystemUoKApplication.class, args);
	}
}
