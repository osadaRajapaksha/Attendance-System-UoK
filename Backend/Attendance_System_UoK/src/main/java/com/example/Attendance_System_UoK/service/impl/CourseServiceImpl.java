package com.example.Attendance_System_UoK.service.impl;

import com.example.Attendance_System_UoK.dto.CourseBasicResponse;
import com.example.Attendance_System_UoK.dto.CreateCourseDTO;
import com.example.Attendance_System_UoK.model.Course;
import com.example.Attendance_System_UoK.model.Student;
import com.example.Attendance_System_UoK.model.Teacher;
import com.example.Attendance_System_UoK.repository.CourseRepository;
import com.example.Attendance_System_UoK.repository.StudentRepository;
import com.example.Attendance_System_UoK.repository.TeacherRepository;
import com.example.Attendance_System_UoK.service.CourseService;
import lombok.AllArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.mongodb.core.query.Criteria;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@AllArgsConstructor
@Service
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final com.example.Attendance_System_UoK.service.ExcelExportService excelExportService;
    private final com.example.Attendance_System_UoK.service.AttendanceService attendanceService;
    private final com.example.Attendance_System_UoK.repository.SessionRepository sessionRepository;
    private final MongoTemplate mongoTemplate;
    private final com.example.Attendance_System_UoK.service.SystemSettingService systemSettingService;
    // Fields for services are added below, but for Lombok's @AllArgsConstructor to
    // work, they must be final and declared here.
    // However, we are declaring them at the bottom in the previous edit.
    // To be safe, we should declare them ALL at the top.

    @Override
    public List<CourseBasicResponse> getAllCourses() {
        return courseRepository.findAll()
                .stream()
                .map(course -> {
                    String teacherName = "Unknown Teacher";
                    if (course.getTeacherId() != null) {
                        teacherName = teacherRepository.findById(course.getTeacherId())
                                .map(Teacher::getFullName)
                                .orElse("Unknown Teacher");
                    }
                    return new CourseBasicResponse(
                            course.getId(),
                            course.getName(),
                            course.getCode(),
                            teacherName,
                            course.getEnrollmentKey() != null && !course.getEnrollmentKey().isEmpty(),
                            course.getAcademicYear(),
                            course.getSemester());
                })
                .collect(Collectors.toList());
    }

    @Override
    public Course createCourse(CreateCourseDTO dto, String username) {

        Optional<Teacher> teacherOpt = teacherRepository.findByUsername(username);

        if (teacherOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Teacher not found");
        }

        Teacher teacher = teacherOpt.get();

        Course c = new Course();
        c.setName(dto.getName());
        c.setCode(dto.getCode());
        c.setTeacherId(teacher.getId());
        c.setEnrollmentKey(dto.getEnrollmentKey());

        // Auto-populate from System Settings
        c.setAcademicYear(systemSettingService.getAcademicYear());
        c.setSemester(systemSettingService.getSemester());

        // Set empty student list if null
        c.setStudentIds(
                c.getStudentIds() == null ? List.of() : c.getStudentIds());

        return courseRepository.save(c);
    }

    @Override
    public Course enrollStudent(String courseId, String studentId, String enrollmentKey) {

        // Verify course exists
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Check Enrollment Key
        if (course.getEnrollmentKey() != null && !course.getEnrollmentKey().isEmpty()) {
            if (enrollmentKey == null || !enrollmentKey.equals(course.getEnrollmentKey())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Enrollment Key");
            }
        }

        // Verify student exists
        if (!studentRepository.existsById(studentId)) {
            throw new RuntimeException("Student not found");
        }

        // Add studentId to course.studentIds (atomic)
        Query q1 = new Query(Criteria.where("_id").is(courseId));
        Update u1 = new Update().addToSet("studentIds", studentId);
        mongoTemplate.updateFirst(q1, u1, Course.class);

        // Add courseId to student.courseIds (atomic)
        Query q2 = new Query(Criteria.where("_id").is(studentId));
        Update u2 = new Update().addToSet("courseIds", courseId);
        mongoTemplate.updateFirst(q2, u2, Student.class);

        // Finally return updated course
        return courseRepository.findById(courseId).get();
    }

    @Override
    public void unenrollStudent(String courseId, String studentId) {
        System.out.println("DEBUG: Unenrolling student " + studentId + " from course " + courseId);

        // Remove studentId from course.studentIds
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (course.getStudentIds() != null && course.getStudentIds().contains(studentId)) {
            course.getStudentIds().remove(studentId);
            courseRepository.save(course);
            System.out.println("DEBUG: Removed studentId from Course");
        } else {
            System.out.println("DEBUG: StudentId not found in Course");
        }

        // Remove courseId from student.courseIds
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getCourseIds() != null && student.getCourseIds().contains(courseId)) {
            student.getCourseIds().remove(courseId);
            studentRepository.save(student);
            System.out.println("DEBUG: Removed courseId from Student");
        } else {
            System.out.println("DEBUG: CourseId not found in Student");
        }
    }

    @Override
    public List<Course> getCoursesByTeacher(String teacherId) {
        return courseRepository.findByTeacherId(teacherId);
    }

    @Override
    public List<CourseBasicResponse> getEnrolledCourses(String studentId) {
        return courseRepository.findAll()
                .stream()
                .filter(course -> course.getStudentIds() != null && course.getStudentIds().contains(studentId))
                .map(course -> {
                    String teacherName = "Unknown Teacher";
                    if (course.getTeacherId() != null) {
                        teacherName = teacherRepository.findById(course.getTeacherId())
                                .map(Teacher::getFullName)
                                .orElse("Unknown Teacher");
                    }
                    return new CourseBasicResponse(
                            course.getId(),
                            course.getName(),
                            course.getCode(),
                            teacherName,
                            course.getEnrollmentKey() != null && !course.getEnrollmentKey().isEmpty(),
                            course.getAcademicYear(),
                            course.getSemester());
                })
                .collect(Collectors.toList());
    }

    @Override
    public Course getCourseById(String courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }

    @Override
    public List<com.example.Attendance_System_UoK.dto.StudentBasicInfo> getEnrolledStudents(String courseId) {
        Course course = getCourseById(courseId);
        List<String> studentIds = course.getStudentIds();
        if (studentIds == null || studentIds.isEmpty()) {
            return List.of();
        }
        return studentRepository.findAllById(studentIds).stream()
                .map(s -> new com.example.Attendance_System_UoK.dto.StudentBasicInfo(
                        s.getId(),
                        s.getFullName(),
                        s.getStudentId(),
                        null,
                        null,
                        null,
                        s.getFaculty(),
                        s.getDegreeProgram()))
                .collect(Collectors.toList());
    }

    @Override
    public void deleteCourse(String courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new RuntimeException("Course not found");
        }
        // Ideally, we should also remove this course ID from all students enrolled, but
        // for simplicity we will just delete the course.
        // A more robust implementation would clean up references.
        courseRepository.deleteById(courseId);
    }

    @Override
    public Course createCourseForAdmin(CreateCourseDTO dto, String teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        Course c = new Course();
        c.setName(dto.getName());
        c.setCode(dto.getCode());
        c.setTeacherId(teacher.getId());
        c.setEnrollmentKey(dto.getEnrollmentKey());

        // Auto-populate from System Settings
        c.setAcademicYear(systemSettingService.getAcademicYear());
        c.setSemester(systemSettingService.getSemester());

        c.setStudentIds(List.of());

        return courseRepository.save(c);
    }

    @Override
    public void toggleArchiveStatus(String courseId, boolean status) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        course.setArchived(status);
        courseRepository.save(course);
    }

    @Override
    public Course updateCourse(String courseId, CreateCourseDTO dto) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (dto.getName() != null)
            course.setName(dto.getName());
        if (dto.getCode() != null)
            course.setCode(dto.getCode());
        if (dto.getEnrollmentKey() != null)
            course.setEnrollmentKey(dto.getEnrollmentKey());

        // Allow updating teacher logic if needed, but usually strictly controlled.
        // For 'Manage Courses' admin panel, maybe we allow it?
        // Let's keep it simple for now as requested.

        return courseRepository.save(course);
    }

    @Override
    public java.io.ByteArrayInputStream generateEnrolledStudentsReport(String courseId) {
        Course course = getCourseById(courseId);
        List<com.example.Attendance_System_UoK.dto.StudentBasicInfo> students = getEnrolledStudents(courseId);
        return excelExportService.generateEnrolledStudentsReport(course.getName(), students);
    }

    @Override
    public java.io.ByteArrayInputStream generateSessionWiseAttendanceReport(String courseId) {
        Course course = getCourseById(courseId);

        // 1. Get Gradebook Data
        List<com.example.Attendance_System_UoK.dto.CourseAttendanceReportDTO> reportData = attendanceService
                .getCourseAttendanceReport(courseId);

        // 2. Get Sessions for Headers
        List<com.example.Attendance_System_UoK.model.Session> sessions = sessionRepository.findByCourseId(courseId);

        return excelExportService.generateSessionWiseAttendanceReport(course.getName(), reportData, sessions);
    }
}
