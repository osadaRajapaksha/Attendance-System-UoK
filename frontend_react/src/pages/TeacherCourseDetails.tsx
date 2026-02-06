import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Container, Button, Card, Row, Col, Spinner, Alert, Modal, Table, Tabs, Tab, Badge, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, DrawingManager } from '@react-google-maps/api';
import api from '../api/axios';

const containerStyle = {
  width: '100%',
  height: '300px'
};

const defaultCenter = {
  lat: 7.2906, 
  lng: 80.6337
};

const TeacherCourseDetails: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    
    // Map Loading
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "AIzaSyA2eLFexIQfCqji9Tgrb73vKVJh0Fm_RXs", // Hardcoded for consistency with Create page
        libraries: ['drawing', 'geometry']
    });

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

    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editSession, setEditSession] = useState<any>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editStart, setEditStart] = useState('');
    const [editEnd, setEditEnd] = useState('');
    const [editBoundary, setEditBoundary] = useState<any[]>([]);
    
    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);

    // Manual Mark State
    const [showManualMarkModal, setShowManualMarkModal] = useState(false);
    const [markingStudentId, setMarkingStudentId] = useState<string | null>(null);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [manualMarkNote, setManualMarkNote] = useState('');

    // Map State
    const [map, setMap] = React.useState(null);
    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const rectRef = useRef<any>(null);

    // Fetch user location on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setMapCenter({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (err) => {
                    console.error("Error getting location: ", err);
                }
            );
        }
    }, []);

    const onLoad = useCallback(function callback(map: any) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map: any) {
        setMap(null);
    }, []);

    const onRectangleComplete = (rect: any) => {
        const bounds = rect.getBounds();
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        
        const corners = [
            { lat: ne.lat(), lng: ne.lng() }, 
            { lat: sw.lat(), lng: ne.lng() }, 
            { lat: sw.lat(), lng: sw.lng() }, 
            { lat: ne.lat(), lng: sw.lng() }  
        ];
        
        setEditBoundary(corners);
        
        if (rectRef.current) {
            rectRef.current.setMap(null);
        }
        rectRef.current = rect;
    };

    // Handlers
    const handleEditClick = (session: any) => {
        setEditSession(session);
        setEditTitle(session.title);
        setEditStart(session.startTime);
        setEditEnd(session.endTime);
        setEditBoundary(session.boundary || []);
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!editSession) return;
        
        try {
            await api.put(`/api/sessions/update/${editSession.id}`, { 
                title: editTitle,
                startTime: editStart,
                endTime: editEnd,
                boundary: editBoundary
            });
            setShowEditModal(false);
            fetchCourseDetails(); // Refresh all
        } catch (err) {
            console.error(err);
            alert("Failed to update session");
        }
    };

    const handleDeleteClick = (sessionId: string) => {
        setDeleteSessionId(sessionId);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteSessionId) return;
        try {
            await api.delete(`/api/sessions/${deleteSessionId}`);
            setShowDeleteModal(false);
            fetchCourseDetails(); // Refresh
        } catch (err) {
            console.error(err);
            alert("Failed to delete session. Ensure it is SCHEDULED.");
        }
    };

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
        setSelectedSessionId(session.id);
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

    const handleManualMarkClick = (studentId: string) => {
        setMarkingStudentId(studentId);
        setManualMarkNote('');
        setShowManualMarkModal(true);
    };

    const handleSubmitManualMark = async () => {
        if (!markingStudentId || !selectedSessionId) return;
        
        try {
            await api.post('/api/attendance/manual-mark', {
                sessionId: selectedSessionId,
                studentId: markingStudentId,
                note: manualMarkNote
            });
            setShowManualMarkModal(false);
            
            // Refresh attendance list
            const res = await api.get(`/api/attendance/session/${selectedSessionId}`);
            setAttendanceList(res.data);
            
        } catch (err) {
            console.error(err);
            alert("Failed to manually mark attendance.");
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
                    <Tabs defaultActiveKey="active" id="session-status-tabs" className="mb-3">
                        {['ACTIVE', 'SCHEDULED', 'EXPIRED', 'DELETED'].map((status) => {
                            const filteredSessions = sessions.filter((s: any) => s.status === status);
                            return (
                                <Tab eventKey={status.toLowerCase()} title={`${status.charAt(0) + status.slice(1).toLowerCase()} (${filteredSessions.length})`}>
                                    {filteredSessions.length === 0 ? <p className="text-muted">No {status.toLowerCase()} sessions.</p> : (
                                        <Row>
                                            {filteredSessions.map((s: any) => (
                                                <Col md={6} key={s.id} className="mb-3">
                                                    <Card className="h-100 border-start border-4" style={{ 
                                                        borderColor: status === 'ACTIVE' ? '#198754' : 
                                                                    status === 'SCHEDULED' ? '#0d6efd' : 
                                                                    status === 'DELETED' ? '#dc3545' : '#6c757d' 
                                                    }}>
                                                        <Card.Body>
                                                            <div className="d-flex justify-content-between align-items-start">
                                                                <div>
                                                                    <Card.Title>{s.title}</Card.Title>
                                                                    <Card.Subtitle className="mb-2 text-muted">
                                                                        {new Date(s.startTime).toLocaleString()}
                                                                    </Card.Subtitle>
                                                                </div>
                                                                
                                                                <div className="d-flex gap-2">
                                                                    {status !== 'EXPIRED' && status !== 'DELETED' && (
                                                                        <Button 
                                                                            variant="link" 
                                                                            size="sm" 
                                                                            className="p-0 text-secondary"
                                                                            onClick={() => handleEditClick(s)}
                                                                        >
                                                                            <i className="bi bi-pencil-square"></i> Edit
                                                                        </Button>
                                                                    )}
                                                                    {status === 'SCHEDULED' && (
                                                                        <Button 
                                                                            variant="link" 
                                                                            size="sm" 
                                                                            className="p-0 text-danger"
                                                                            onClick={() => handleDeleteClick(s.id)}
                                                                        >
                                                                            <i className="bi bi-trash"></i> Delete
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="d-flex justify-content-between align-items-center mt-3">
                                                                <Badge bg={
                                                                    status === 'ACTIVE' ? 'success' : 
                                                                    status === 'SCHEDULED' ? 'primary' : 
                                                                    status === 'DELETED' ? 'danger' : 'secondary'
                                                                }>{s.status}</Badge>
                                                                {status !== 'DELETED' && (
                                                                    <Button variant="outline-primary" size="sm" onClick={() => handleViewAttendance(s)}>
                                                                        View Attendance
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    )}
                                </Tab>
                            );
                        })}
                    </Tabs>
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

            {/* Edit Session Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Session</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={editTitle} 
                                onChange={(e) => setEditTitle(e.target.value)} 
                            />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Start Time</Form.Label>
                                    <Form.Control 
                                        type="datetime-local" 
                                        value={editStart} 
                                        onChange={(e) => setEditStart(e.target.value)} 
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>End Time</Form.Label>
                                    <Form.Control 
                                        type="datetime-local" 
                                        value={editEnd} 
                                        onChange={(e) => setEditEnd(e.target.value)} 
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                                    <Form.Group className="mb-3">
                            <Form.Label>Location (Redraw to update)</Form.Label>
                            {isLoaded ? (
                                <GoogleMap
                                    mapContainerStyle={containerStyle}
                                    center={mapCenter}
                                    zoom={15}
                                    onLoad={onLoad}
                                    onUnmount={onUnmount}
                                >
                                    <DrawingManager
                                        onRectangleComplete={onRectangleComplete}
                                        options={{
                                            drawingControl: true,
                                            drawingControlOptions: {
                                                drawingModes: ['rectangle' as any]
                                            },
                                            rectangleOptions: {
                                                editable: true,
                                                draggable: true
                                            }
                                        }}
                                    />
                                </GoogleMap>
                            ) : <Spinner animation="border" />}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSaveEdit}>Save Changes</Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete this session? This action cannot be undone.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleConfirmDelete}>Delete</Button>
                </Modal.Footer>
            </Modal>

            {/* Manual Mark Modal */}
            <Modal show={showManualMarkModal} onHide={() => { setShowManualMarkModal(false); setManualMarkNote(''); }}>
                <Modal.Header closeButton>
                    <Modal.Title>Manual Mark Attendance</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Note (Optional)</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3} 
                                value={manualMarkNote} 
                                onChange={(e) => setManualMarkNote(e.target.value)} 
                                placeholder="Reason for manual marking..."
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowManualMarkModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSubmitManualMark}>Mark Present</Button>
                </Modal.Footer>
            </Modal>

            {/* Attendance Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>Attendance: {selectedSessionTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loadingAttendance ? <Spinner animation="border" /> : (
                         enrolledStudents.length === 0 ? <p>No students enrolled in this course.</p> : (
                             <Table striped hover responsive>
                                 <thead>
                                     <tr>
                                         <th>Student Name</th>
                                         <th>Index No</th>
                                         <th>Status</th>
                                         <th>Detail Log</th>
                                         <th>Actions</th>
                                     </tr>
                                 </thead>
                                 <tbody>
                                     {enrolledStudents.map((stu: any) => {
                                         const attendanceRecord = attendanceList.find((att: any) => att.studentId === stu.id || att.studentId === stu.studentId);
                                         
                                         // Status Logic: 
                                         // If manually marked: PRESENT (Manual)
                                         // If normal: check if completed required check-ins? 
                                         // The backend session service should ideally tell us completion status, but here we have raw Attendance object.
                                         // We can check logic: attendanceRecord.status === 'PRESENT'
                                         
                                         const isPresent = attendanceRecord && attendanceRecord.status === 'PRESENT';
                                         const isManual = attendanceRecord?.isManuallyMarked;
                                         
                                         return (
                                             <tr key={stu.id} className={isPresent ? "table-success" : ""}>
                                                 <td>{stu.fullName}</td>
                                                 <td>{stu.studentId}</td>
                                                 <td>
                                                     {isPresent ? (
                                                         <Badge bg="success">
                                                            Present {isManual ? '(Manual)' : ''}
                                                         </Badge>
                                                     ) : <Badge bg="danger">Absent</Badge>}
                                                 </td>
                                                 <td>
                                                     {attendanceRecord ? (
                                                         <ul className="list-unstyled mb-0 small">
                                                            {attendanceRecord.checkInTimes?.map((time: string, i: number) => (
                                                                <li key={i}>{new Date(time).toLocaleTimeString()}</li>
                                                            ))}
                                                            {isManual && <li className="text-muted fst-italic">Note: {attendanceRecord.manualMarkNote}</li>}
                                                            {attendanceRecord.deviceMismatchInfo && (
                                                                <li className="text-danger fw-bold mt-1">
                                                                    <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                                                    Device Owner: {attendanceRecord.deviceMismatchInfo}
                                                                </li>
                                                            )}
                                                        </ul>
                                                     ) : "-"}
                                                 </td>
                                                 <td>
                                                     {!isPresent && (
                                                         <Button 
                                                            variant="outline-primary" 
                                                            size="sm"
                                                            onClick={() => handleManualMarkClick(stu.id)}
                                                         >
                                                             Manual Mark
                                                         </Button>
                                                     )}
                                                 </td>
                                             </tr>
                                         );
                                     })}
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
