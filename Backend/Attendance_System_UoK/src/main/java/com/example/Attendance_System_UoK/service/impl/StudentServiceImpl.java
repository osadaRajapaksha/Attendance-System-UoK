package com.example.Attendance_System_UoK.service.impl;

import com.example.Attendance_System_UoK.dto.UserResponse;
import com.example.Attendance_System_UoK.model.User;
import com.example.Attendance_System_UoK.repository.StudentRepository;
import com.example.Attendance_System_UoK.service.StudentService;
import org.springframework.stereotype.Service;

@Service
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;

    public StudentServiceImpl(StudentRepository studentRepository,
            com.example.Attendance_System_UoK.repository.CourseRepository courseRepository) {
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
    }

    @Override
    public UserResponse getStudentByUsername(String username) {
        User user = studentRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToUserResponse(user);
    }

    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getFullName(),
                null, // teacherId
                null, // position
                user instanceof com.example.Attendance_System_UoK.model.Student
                        ? ((com.example.Attendance_System_UoK.model.Student) user).getStudentId()
                        : null,
                user.getDepartment(),
                user instanceof com.example.Attendance_System_UoK.model.Student
                        ? ((com.example.Attendance_System_UoK.model.Student) user).getDegreeProgram()
                        : null,
                user.getFaculty(),
                user instanceof com.example.Attendance_System_UoK.model.Student
                        ? ((com.example.Attendance_System_UoK.model.Student) user).getArchivedCourseIds()
                        : null);
    }

    @Override
    public org.springframework.data.domain.Page<UserResponse> getAllStudents(
            org.springframework.data.domain.Pageable pageable) {
        return studentRepository.findAll(pageable)
                .map(this::mapToUserResponse);
    }

    @Override
    public UserResponse updateStudent(String id, com.example.Attendance_System_UoK.dto.RegisterRequest studentDetails) {
        com.example.Attendance_System_UoK.model.Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (studentDetails.getFullName() != null)
            student.setFullName(studentDetails.getFullName());
        if (studentDetails.getEmail() != null)
            student.setEmail(studentDetails.getEmail());
        if (studentDetails.getStudentId() != null)
            student.setStudentId(studentDetails.getStudentId());
        if (studentDetails.getFaculty() != null)
            student.setFaculty(studentDetails.getFaculty());
        if (studentDetails.getDegreeProgram() != null)
            student.setDegreeProgram(studentDetails.getDegreeProgram());

        // Department update is intentionally skipped as per requirement

        studentRepository.save(student);
        return mapToUserResponse(student);
    }

    @Override
    public java.util.List<com.example.Attendance_System_UoK.model.Course> getStudentCourses(String studentId) {
        com.example.Attendance_System_UoK.model.Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Student has a list of courseIds they are enrolled in
        java.util.List<String> enrolledCourseIds = student.getCourseIds();

        if (enrolledCourseIds == null || enrolledCourseIds.isEmpty()) {
            return java.util.Collections.emptyList();
        }

        // We need repository access to find courses by IDs.
        // Since StudentServiceImpl only has studentRepository injected, we need to
        // inject CourseRepository.
        // I will add the CourseRepository field below and update constructor.
        return courseRepository.findAllById(enrolledCourseIds);
    }

    private final com.example.Attendance_System_UoK.repository.CourseRepository courseRepository;

    @Override
    public void archiveCourse(String username, String courseId) {
        com.example.Attendance_System_UoK.model.Student student = (com.example.Attendance_System_UoK.model.Student) studentRepository
                .findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (!student.getArchivedCourseIds().contains(courseId)) {
            student.getArchivedCourseIds().add(courseId);
            studentRepository.save(student);
        }
    }

    @Override
    public void unarchiveCourse(String username, String courseId) {
        com.example.Attendance_System_UoK.model.Student student = (com.example.Attendance_System_UoK.model.Student) studentRepository
                .findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getArchivedCourseIds().contains(courseId)) {
            student.getArchivedCourseIds().remove(courseId);
            studentRepository.save(student);
        }
    }
}
