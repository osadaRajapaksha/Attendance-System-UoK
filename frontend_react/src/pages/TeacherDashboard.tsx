import React, { useEffect, useState, useContext } from 'react';
import { Container, Button, Modal, Form, Alert, Spinner, Card, Row, Col, Badge, Tabs, Tab } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

interface Course {
  id: string;
  name: string;
  code: string;
  archived: boolean;
  academicYear?: string;
  semester?: string;
}

const TeacherDashboard: React.FC = () => {
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [currentTerm, setCurrentTerm] = useState('');

  const user = useContext(AuthContext)?.user;
  
  // Account State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passError, setPassError] = useState('');
  
  // Form State
  const [newCourse, setNewCourse] = useState({ name: '', code: '', enrollmentKey: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchMyCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/courses/teacher');
      setMyCourses(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
    api.get('/api/system/general').then(res => {
        if (res.data.academicYear && res.data.semester) {
            setCurrentTerm(`${res.data.academicYear} - ${res.data.semester}`);
        }
    }).catch(err => console.error("Failed to fetch system settings", err));
  }, []);

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

  const handleCreate = async () => {
    try {
      await api.post('/api/courses/create', newCourse);
      setSuccess('Course created successfully');
      setShowModal(false);
      setNewCourse({ name: '', code: '', enrollmentKey: '' });
      fetchMyCourses();
    } catch (err) {
      console.error(err);
      setError('Failed to create course');
    }
  };

  const handleArchiveToggle = async (course: Course) => {
      const endpoint = course.archived ? `/api/courses/${course.id}/unarchive` : `/api/courses/${course.id}/archive`;
      try {
          await api.put(endpoint);
          setSuccess(course.archived ? 'Course restored' : 'Course archived');
          fetchMyCourses();
      } catch (err) {
          console.error(err);
          setError('Failed to update course status');
      }
  };

  const CourseCard = ({ course }: { course: Course }) => {
     return (
        <Col md={4} lg={3} className="mb-4">
           <Card className={`course-card h-100 border-0 shadow-sm ${course.archived ? 'bg-light text-muted' : ''}`}>
              <Card.Body className="d-flex flex-column">
                 <div className="d-flex justify-content-between align-items-center mb-3">
                    <Badge bg={course.archived ? "secondary" : "primary"} className="p-2 fs-6">{course.code}</Badge>
                    {course.archived && <Badge bg="warning" text="dark">Archived</Badge>}
                 </div>
                 <Card.Title className="fw-bold fs-5 mb-2">{course.name}</Card.Title>
                 {course.academicYear && course.semester && (
                    <div className="mb-3 small text-muted">
                        <i className="bi bi-calendar-event me-1"></i>
                        {course.academicYear} - {course.semester}
                    </div>
                 )}
                 
                 <div className="mt-auto pt-3 d-flex gap-2 flex-column">
                    <Link to={`/teacher/course/${course.id}`} className="btn btn-outline-primary w-100">
                        {course.archived ? 'View Archived Details' : 'View Details'}
                    </Link>
                    <Button 
                        variant={course.archived ? "outline-success" : "outline-secondary"} 
                        size="sm" 
                        className="w-100"
                        onClick={() => handleArchiveToggle(course)}
                    >
                        {course.archived ? 'Restore Course' : 'Archive Course'}
                    </Button>
                 </div>
              </Card.Body>
           </Card>
        </Col>
     );
  };

  const activeCourses = myCourses.filter(c => !c.archived);
  const archivedCourses = myCourses.filter(c => c.archived);

  return (
    <Container className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h2 className="page-title mb-0">Teacher Dashboard</h2>
            {currentTerm && <Badge bg="info" className="text-dark mt-2">{currentTerm}</Badge>}
        </div>
        <Button variant="success" className="px-4 py-2 fw-bold" onClick={() => setShowModal(true)}>
           + Create Course
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {loading ? (
          <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
         <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'active')} className="mb-4">
             <Tab eventKey="active" title={`Active (${activeCourses.length})`}>
                 <Row className="g-4">
                    {activeCourses.map(course => (
                       <CourseCard key={course.id} course={course} />
                    ))}
                    {activeCourses.length === 0 && (
                       <Col xs={12} className="text-center mt-5">
                          <p className="text-muted">No active courses.</p>
                       </Col>
                    )}
                 </Row>
             </Tab>
             <Tab eventKey="archived" title={`Archived (${archivedCourses.length})`}>
                 <Row className="g-4">
                    {archivedCourses.map(course => (
                       <CourseCard key={course.id} course={course} />
                    ))}
                    {archivedCourses.length === 0 && (
                       <Col xs={12} className="text-center mt-5">
                          <p className="text-muted">No archived courses.</p>
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
                           <Col sm={4} className="fw-bold">Teacher ID:</Col>
                           <Col sm={8}>{user?.teacherId || 'N/A'}</Col>
                        </Row>
                        <Row className="mb-2">
                           <Col sm={4} className="fw-bold">Faculty:</Col>
                           <Col sm={8}>{user?.faculty || 'N/A'}</Col>
                        </Row>
                        {/* Department not available in User interface currently */}
                        
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

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create New Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Course Code</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="e.g. CS101"
                value={newCourse.code} 
                onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Course Name</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="e.g. Introduction to Programming"
                value={newCourse.name} 
                onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Enrollment Key (Optional)</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Leave empty if none"
                value={newCourse.enrollmentKey} 
                onChange={(e) => setNewCourse({...newCourse, enrollmentKey: e.target.value})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          <Button variant="success" onClick={handleCreate}>Create Course</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TeacherDashboard;
