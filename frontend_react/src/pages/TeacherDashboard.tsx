import React, { useEffect, useState } from 'react';
import { Container, Button, Modal, Form, Alert, Spinner, Card, Row, Col, Badge, Tabs, Tab } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../api/axios';

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
                    <Button variant="outline-primary" className="w-100" as={Link} to={`/teacher/course/${course.id}`}>
                        {course.archived ? 'View Archived Details' : 'View Details'}
                    </Button>
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
         </Tabs>
      )}

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
