import React, { useEffect, useState } from 'react';
import { Container, Button, Card, Row, Col, Spinner, Alert, Modal, Table, Tabs, Tab, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const TeacherCourseDetails: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = useState<any>(null);
    const [sessions, setSessions] = useState<any[]>([]);
    const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Attendance Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedSessionTitle, setSelectedSessionTitle] = useState('');
    const [attendanceList, setAttendanceList] = useState<any[]>([]);
    const [loadingAttendance, setLoadingAttendance] = useState(false);

    useEffect(() => {
        fetchCourseDetails();
    }, [courseId]);

    const fetchCourseDetails = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/courses/${courseId}`); 
            setCourse(res.data);

            const sessRes = await api.get(`/api/sessions/course/${courseId}`);
            setSessions(sessRes.data);
            
            const enrolledRes = await api.get(`/api/courses/${courseId}/students`);
            setEnrolledStudents(enrolledRes.data);
            
        } catch (err: any) {
            console.error(err);
            setError("Failed to load course details.");
        } finally {
            setLoading(false);
        }
    };

    const handleViewAttendance = async (session: any) => {
        setSelectedSessionTitle(session.title);
        setShowModal(true);
        setLoadingAttendance(true);
        setAttendanceList([]);
        try {
             const res = await api.get(`/api/attendance/session/${session.id}`);
             setAttendanceList(res.data);
        } catch (err) {
            console.error(err);
             alert("Failed to fetch attendance");
        } finally {
            setLoadingAttendance(false);
        }
    };

    const handleRemoveStudent = async (studentId: string) => {
        if (!window.confirm("Are you sure you want to remove this student from the course?")) return;
        
        try {
            await api.delete(`/api/courses/${courseId}/unenroll/${studentId}`);
            alert("Student removed successfully.");
            fetchCourseDetails(); // Refresh list
        } catch (err) {
            console.error(err);
            alert("Failed to remove student.");
        }
    };

    if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
    if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
    if (!course) return <Container className="mt-5"><Alert variant="warning">Course not found</Alert></Container>;

    return (
        <Container className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                     <h2 className="mb-0">{course.name}</h2>
                     <p className="text-muted">{course.code}</p>
                </div>
                <Button variant="primary" onClick={() => navigate(`/teacher/course/${courseId}/create-session`)}>
                    + Create Session
                </Button>
            </div>
            
            <Tabs defaultActiveKey="sessions" className="mb-3">
                <Tab eventKey="sessions" title="Sessions">
                     {sessions.length === 0 ? <p>No sessions created.</p> : (
                        <Row>
                            {sessions.map((s: any) => (
                                 <Col md={6} key={s.id} className="mb-3">
                                     <Card className="h-100">
                                         <Card.Body>
                                             <Card.Title>{s.title}</Card.Title>
                                             <Card.Subtitle className="mb-2 text-muted">
                                                 {new Date(s.startTime).toLocaleString()}
                                             </Card.Subtitle>
                                             <div className="d-flex justify-content-between align-items-center mt-3">
                                                 <Badge bg="info">{s.status}</Badge>
                                                 <Button variant="outline-primary" size="sm" onClick={() => handleViewAttendance(s)}>
                                                     View Attendance
                                                 </Button>
                                             </div>
                                         </Card.Body>
                                     </Card>
                                 </Col>
                            ))}
                        </Row>
                    )}
                </Tab>
                <Tab eventKey="students" title={`Enrolled Students (${enrolledStudents.length})`}>
                    <Card>
                        <Card.Body>
                            {enrolledStudents.length === 0 ? <p>No students enrolled.</p> : (
                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Student ID</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {enrolledStudents.map((stu: any) => (
                                            <tr key={stu.id}>
                                                <td>{stu.fullName}</td>
                                                <td>{stu.studentId}</td>
                                                <td>
                                                    <Button 
                                                        variant="danger" 
                                                        size="sm"
                                                        onClick={() => handleRemoveStudent(stu.id)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Tab>
            </Tabs>

            {/* Attendance Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Attendance: {selectedSessionTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loadingAttendance ? <Spinner animation="border" /> : (
                         attendanceList.length === 0 ? <p>No attendance marked yet.</p> : (
                             <Table striped hover>
                                 <thead>
                                     <tr>
                                         <th>Student Name</th>
                                         <th>Index No</th>
                                         <th>Marked At</th>
                                     </tr>
                                 </thead>
                                 <tbody>
                                     {attendanceList.map((rec: any, idx: number) => (
                                         <tr key={idx}>
                                             <td>{rec.fullName || "Unknown"}</td>
                                             <td>{rec.studentId || "N/A"}</td>
                                             <td>{rec.markedAt ? new Date(rec.markedAt).toLocaleTimeString() : "-"}</td>
                                         </tr>
                                     ))}
                                 </tbody>
                             </Table>
                         )
                    )}
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default TeacherCourseDetails;
