import React, { useEffect, useState, useContext } from 'react';
import { Container, Tabs, Tab, Button, Alert, Spinner, Badge, Card, Row, Col, Modal, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

interface Course {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  teacherName: string;
  hasEnrollmentKey: boolean;
}

const StudentDashboard: React.FC = () => {
  const user = useContext(AuthContext)?.user;
  const navigate = useNavigate();
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

  /* New State for Enrollment Modal */
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrollmentKey, setEnrollmentKey] = useState('');

  // Account State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passError, setPassError] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg('');
    setPassError('');

    if (newPassword !== confirmPassword) {
      setPassError("New passwords do not match");
      return;
    }

    try {
      await api.post('/api/users/change-password', {
        oldPassword,
        newPassword,
        confirmNewPassword: confirmPassword
      });
      setPassMsg("Password changed successfully");
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setShowPasswordModal(false), 2000);
    } catch (err: any) {
       console.error(err);
       setPassError(err.response?.data?.message || "Failed to change password");
    }
  };

  const handleEnrollClick = (course: Course) => {
      if (course.hasEnrollmentKey) {
          setSelectedCourse(course);
          setEnrollmentKey('');
          setShowEnrollModal(true);
      } else {
          submitEnrollment(course.id, null);
      }
  };

  const submitEnrollment = async (courseId: string, key: string | null) => {
    try {
      setError('');
      setSuccess('');
      
      await api.post(`/api/courses/${courseId}/enroll${key ? `?key=${key}` : ''}`);
      setSuccess('Enrolled successfully!');
      setShowEnrollModal(false);
      fetchEnrolledCourses();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Enrollment failed');
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
                <Button variant="primary" className="w-100" onClick={() => handleEnrollClick(course)}>
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
          <Tab eventKey="account" title="Account">
            <Row className="justify-content-center mt-4">
              <Col md={8}>
                 <Card className="mb-4">
                  <Card.Header as="h5">My Profile</Card.Header>
                  <Card.Body>
                    <Row className="mb-2">
                       <Col sm={4} className="fw-bold">Full Name:</Col>
                       <Col sm={8}>{user?.fullName}</Col>
                    </Row>
                    <Row className="mb-2">
                       <Col sm={4} className="fw-bold">Email:</Col>
                       <Col sm={8}>{user?.email}</Col>
                    </Row>
                    <Row className="mb-2">
                       <Col sm={4} className="fw-bold">Student ID:</Col>
                       <Col sm={8}>{user?.studentId || 'N/A'}</Col>
                    </Row>
                     <Row className="mb-2">
                       <Col sm={4} className="fw-bold">Degree Program:</Col>
                       <Col sm={8}>{user?.degreeProgram|| 'N/A'}</Col>
                    </Row>
                    <Row className="mb-2">
                       <Col sm={4} className="fw-bold">Faculty:</Col>
                       <Col sm={8}>{user?.faculty || 'N/A'}</Col>
                    </Row>
                    
                    <div className="mt-4">
                        <Button variant="outline-primary" onClick={() => {
                            setPassMsg('');
                            setPassError('');
                            setOldPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                            setShowPasswordModal(true);
                        }}>
                             <i className="bi bi-key-fill me-2"></i>Change Password
                        </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>
        </Tabs>
      )}

      {/* Change Password Modal */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
        <Modal.Header closeButton>
            <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {passError && <Alert variant="danger">{passError}</Alert>}
            {passMsg && <Alert variant="success">{passMsg}</Alert>}
            <Form onSubmit={handleChangePassword}>
                <Form.Group className="mb-3">
                <Form.Label>Old Password</Form.Label>
                <Form.Control 
                    type="password" 
                    required 
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                />
                </Form.Group>
                <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control 
                    type="password" 
                    required 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                />
                </Form.Group>
                <Form.Group className="mb-3">
                <Form.Label>Confirm New Password</Form.Label>
                <Form.Control 
                    type="password" 
                    required 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                />
                </Form.Group>
                <div className="d-flex justify-content-end">
                    <Button variant="secondary" className="me-2" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
                    <Button variant="warning" type="submit">Update Password</Button>
                </div>
            </Form>
        </Modal.Body>
      </Modal>

      {/* Enrollment Key Modal */}
      <Modal show={showEnrollModal} onHide={() => setShowEnrollModal(false)} centered>
        <Modal.Header closeButton>
            <Modal.Title>Enter Enrollment Key</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <p>The course <strong>{selectedCourse?.name}</strong> requires an enrollment key.</p>
            <Form.Group>
                <Form.Label>Enrollment Key</Form.Label>
                <Form.Control 
                    type="password" 
                    placeholder="Enter key" 
                    value={enrollmentKey} 
                    onChange={(e) => setEnrollmentKey(e.target.value)}
                />
            </Form.Group>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEnrollModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => selectedCourse && submitEnrollment(selectedCourse.id, enrollmentKey)}>Enroll</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default StudentDashboard;
