package com.example.Attendance_System_UoK.service.impl;

import com.example.Attendance_System_UoK.dto.CreateCourseDTO;
import com.example.Attendance_System_UoK.model.Course;
import com.example.Attendance_System_UoK.model.Student;
import com.example.Attendance_System_UoK.model.Teacher;
import com.example.Attendance_System_UoK.repository.CourseRepository;
import com.example.Attendance_System_UoK.repository.StudentRepository;
import com.example.Attendance_System_UoK.repository.TeacherRepository;
import com.example.Attendance_System_UoK.service.CourseService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.mongodb.core.query.Criteria;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;


import java.util.List;
import java.util.Optional;

@AllArgsConstructor
@Service
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;



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
                c.getStudentIds() == null ? List.of() : c.getStudentIds()
        );

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
    public List<Course> getCoursesByTeacher(String teacherId) {
        return courseRepository.findByTeacherId(teacherId);
    }
}
