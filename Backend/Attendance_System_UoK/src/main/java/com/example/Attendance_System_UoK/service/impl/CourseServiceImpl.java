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
                            teacherName);
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

        // Set empty student list if null
        c.setStudentIds(
                c.getStudentIds() == null ? List.of() : c.getStudentIds());

        return courseRepository.save(c);
    }

    private MongoTemplate mongoTemplate;

    @Override
    public Course enrollStudent(String courseId, String studentId) {

        // Verify course exists
        if (!courseRepository.existsById(courseId)) {
            throw new RuntimeException("Course not found");
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
        // Remove studentId from course.studentIds (atomic)
        Query q1 = new Query(Criteria.where("_id").is(courseId));
        Update u1 = new Update().pull("studentIds", studentId);
        mongoTemplate.updateFirst(q1, u1, Course.class);

        // Remove courseId from student.courseIds (atomic)
        Query q2 = new Query(Criteria.where("_id").is(studentId));
        Update u2 = new Update().pull("courseIds", courseId);
        mongoTemplate.updateFirst(q2, u2, Student.class);
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
                            teacherName);
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
                        s.getId(), s.getFullName(), s.getStudentId(), null))
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
        c.setStudentIds(List.of());

        return courseRepository.save(c);
    }
}
