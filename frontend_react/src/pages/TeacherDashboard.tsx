import React, { useEffect, useState } from 'react';
import { Container, Button, Modal, Form, Alert, Spinner, Card, Row, Col, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../api/axios';

interface Course {
  id: string;
  name: string;
  code: string;
}

const TeacherDashboard: React.FC = () => {
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
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

  const CourseCard = ({ course }: { course: Course }) => {
     return (
        <Col md={4} lg={3} className="mb-4">
           <Card className="course-card h-100 border-0 shadow-sm">
              <Card.Body className="d-flex flex-column">
                 <div className="d-flex justify-content-between align-items-center mb-3">
                    <Badge bg="primary" className="p-2 fs-6">{course.code}</Badge>
                 </div>
                 <Card.Title className="fw-bold fs-5 mb-3">{course.name}</Card.Title>
                 <Card.Text className="text-muted flex-grow-1">
                    Manage and view details for {course.name}.
                 </Card.Text>
                 <div className="mt-3">
                    <Button variant="outline-primary" className="w-100" as={Link} to={`/teacher/course/${course.id}`}>View Details</Button>
                 </div>
              </Card.Body>
           </Card>
        </Col>
     );
  };

  return (
    <Container className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title mb-0">Teacher Dashboard</h2>
        <Button variant="success" className="px-4 py-2 fw-bold" onClick={() => setShowModal(true)}>
           + Create Course
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {loading ? (
          <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
         <Row className="g-4">
            {myCourses.map(course => (
               <CourseCard key={course.id} course={course} />
            ))}
            {myCourses.length === 0 && (
               <Col xs={12} className="text-center mt-5">
                  <div className="p-5 bg-light rounded-3">
                     <p className="text-muted fs-4 mb-3">No courses created yet.</p>
                     <Button variant="primary" onClick={() => setShowModal(true)}>Create Your First Course</Button>
                  </div>
               </Col>
            )}
         </Row>
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
