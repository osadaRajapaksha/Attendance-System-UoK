import React, { useEffect, useState } from 'react';
import { Container, Tabs, Tab, Button, Alert, Spinner, Badge, Card, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../api/axios';

interface Course {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  teacherName: string;
}

const StudentDashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCourses = async () => {
    try {
      const res = await api.get('/api/courses');
      setCourses(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load courses');
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const res = await api.get<Course[]>('/api/courses/enrolled');
      setEnrolledCourseIds(res.data.map(c => c.id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchCourses(), fetchEnrolledCourses()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleEnroll = async (courseId: string) => {
    try {
      setError('');
      setSuccess('');
      await api.post(`/api/courses/${courseId}/enroll`);
      setSuccess('Enrolled successfully!');
      fetchEnrolledCourses();
    } catch (err) {
      setError('Enrollment failed');
      console.error(err);
    }
  };

  const isEnrolled = (courseId: string) => enrolledCourseIds.includes(courseId);

  const CourseCard = ({ course }: { course: Course }) => {
    const enrolled = isEnrolled(course.id);
    return (
      <Col md={4} lg={3} className="mb-4">
        <Card className="course-card h-100">
          <Card.Body className="d-flex flex-column">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <Badge bg="info" className="p-2">{course.code}</Badge>
              {enrolled ? <Badge bg="success">Enrolled</Badge> : <Badge bg="secondary">Not Enrolled</Badge>}
            </div>
            <Card.Title className="mt-2 text-truncate" title={course.name}>{course.name}</Card.Title>
            <Card.Subtitle className="mb-3 text-muted small">
                 <i className="bi bi-person-fill me-1"></i>
                 {course.teacherName}
            </Card.Subtitle>
            <Card.Text className="text-muted flex-grow-1">
              Explore the content of {course.name}.
            </Card.Text>
            <div className="mt-3">
              {!enrolled ? (
                <Button variant="primary" className="w-100" onClick={() => handleEnroll(course.id)}>
                  Enroll Now
                </Button>
              ) : (
                <Button variant="outline-success" className="w-100" as={Link} to={`/student/course/${course.id}`}>
                  Go to Course
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      </Col>
    );
  };

  return (
    <Container className="mt-5">
       <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title mb-0">Student Dashboard</h2>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      {loading ? (
         <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <Tabs defaultActiveKey="all_courses" id="student-tabs" className="mb-3 justify-content-center">
          <Tab eventKey="all_courses" title="All Courses">
            <Row className="g-4 mt-2">
              {courses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </Row>
          </Tab>
          <Tab eventKey="my_courses" title="My Courses">
             <Row className="g-4 mt-2">
              {courses.filter(c => isEnrolled(c.id)).map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
              {courses.filter(c => isEnrolled(c.id)).length === 0 && (
                 <Col xs={12} className="text-center mt-5">
                    <p className="text-muted fs-5">You have not enrolled in any courses yet.</p>
                 </Col>
              )}
            </Row>
          </Tab>
        </Tabs>
      )}
    </Container>
  );
};

export default StudentDashboard;
