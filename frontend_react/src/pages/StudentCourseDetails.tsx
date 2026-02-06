import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Badge, Spinner, Alert, Tabs, Tab, Button, Row, Col, Modal } from 'react-bootstrap';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

// Interfaces
interface Session {
    id: string;
    courseId: string;
    teacherId: string;
    title: string;
    startTime: string;
    endTime: string;
    boundary: { lat: number; lng: number }[];
    status: 'SCHEDULED' | 'ACTIVE' | 'EXPIRED';
}

interface Course {
    id: string;
    name: string;
    code: string;
    teacherName: string;
}

const Countdown = ({ targetDate, onComplete }: { targetDate: string, onComplete?: () => void }) => {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const target = new Date(targetDate).getTime();
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft("Starting soon...");
                clearInterval(interval);
                if (onComplete) onComplete();
            } else {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                
                let s = "";
                if (days > 0) s += `${days}d `;
                s += `${hours}h ${minutes}m ${seconds}s`;
                setTimeLeft(s);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [targetDate, onComplete]);

    return <div className="text-primary fw-bold">Starts in: {timeLeft}</div>;
};

const StudentCourseDetails: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const user = useContext(AuthContext)?.user;
    
    const [course, setCourse] = useState<Course | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [markedSessionIds, setMarkedSessionIds] = useState<string[]>([]);
    const [markingSessionId, setMarkingSessionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');
    const [showUnenrollModal, setShowUnenrollModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // History Modal State
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedHistorySession, setSelectedHistorySession] = useState<Session | null>(null);

    const fetchData = async () => {
        setLoading(prev => sessions.length === 0);
        try {
            if (!course) {
                const courseRes = await api.get(`/api/courses/${courseId}`);
                setCourse(courseRes.data);
            }
            const sessionRes = await api.get(`/api/sessions/course/${courseId}`);
            setSessions(sessionRes.data);

            const markedRes = await api.get('/api/attendance/student/marked');
            setMarkedSessionIds(markedRes.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load course data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (courseId) fetchData();
    }, [courseId]);

    const handleUnenroll = async () => {
        try {
            await api.delete(`/api/courses/${courseId}/unenroll/${user?.id}`);
            setShowUnenrollModal(false);
            setShowSuccessModal(true);
        } catch (err: any) {
            console.error(err);
            setError("Failed to unenroll.");
            setShowUnenrollModal(false);
        }
    };

    const handleHistoryClick = (session: Session) => {
        setSelectedHistorySession(session);
        setShowHistoryModal(true);
    };

    const markAttendance = async (sessionId: string) => {
        setMsg('');
        setError('');
        setMarkingSessionId(sessionId);
        
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            setMarkingSessionId(null);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    await api.post('/api/sessions/mark', {
                        sessionId,
                        lat: latitude,
                        lng: longitude
                    });
                    setMsg("Attendance Marked Successfully!");
                    fetchData(); // Refresh marked status
                } catch (err: any) {
                    console.error(err);
                    setError(err.response?.data?.message || "Failed to mark attendance.");
                } finally {
                    setMarkingSessionId(null);
                }
            },
            (err) => {
                console.error(err);
                setError("Unable to retrieve location. Please allow location access.");
                setMarkingSessionId(null);
            }
        );
    };

    const categorizeSessions = (status: string) => sessions.filter(s => s.status === status);

    if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
    if (!course) return <Container className="mt-5"><Alert variant="danger">Course not found</Alert></Container>;

    return (
        <Container className="mt-5">
            <Button variant="outline-secondary" className="mb-3" onClick={() => navigate('/student-dashboard')}>
                &larr; Back to Dashboard
            </Button>
            
            <Card className="mb-4 shadow-sm border-0">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                           <h3>{course.name} <Badge bg="info">{course.code}</Badge></h3>
                           <p className="text-muted mb-0">Teacher: {course.teacherName}</p>
                        </div>
                        <Button variant="danger" onClick={() => setShowUnenrollModal(true)}>Unenroll</Button>
                    </div>
                </Card.Body>
            </Card>

            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
            {msg && <Alert variant="success" dismissible onClose={() => setMsg('')}>{msg}</Alert>}

            {/* Statistics Section */}
            {!loading && (
                <div className="mb-4">
                    <h4 className="mb-3">Attendance Overview</h4>
                    <Row className="g-3">
                        {/* Percentage Card */}
                        <Col md={3}>
                            <Card className="h-100 text-center shadow-sm border-0 bg-primary text-white">
                                <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                                    <h6 className="opacity-75">Attendance Rate</h6>
                                    <h1 className="display-4 fw-bold mb-0">
                                        {(() => {
                                            const pastSessions = sessions.filter(s => s.status === 'EXPIRED');
                                            const presentCount = pastSessions.filter(s => markedSessionIds.includes(s.id)).length;
                                            const total = pastSessions.length;
                                            return total > 0 ? Math.round((presentCount / total) * 100) : 0;
                                        })()}%
                                    </h1>
                                </Card.Body>
                            </Card>
                        </Col>
                        
                        {/* Stats Grid */}
                        <Col md={9}>
                            <Row className="g-3 h-100">
                                <Col sm={4}>
                                    <Card className="h-100 shadow-sm border-0 border-start border-success border-4">
                                        <Card.Body>
                                            <div className="text-secondary small mb-1">Present Sessions</div>
                                            <h3 className="fw-bold text-success mb-0">
                                                {sessions.filter(s => s.status === 'EXPIRED' && markedSessionIds.includes(s.id)).length}
                                            </h3>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col sm={4}>
                                    <Card className="h-100 shadow-sm border-0 border-start border-danger border-4">
                                        <Card.Body>
                                            <div className="text-secondary small mb-1">Absent Sessions</div>
                                            <h3 className="fw-bold text-danger mb-0">
                                                {(() => {
                                                    const pastSessions = sessions.filter(s => s.status === 'EXPIRED');
                                                    const presentCount = pastSessions.filter(s => markedSessionIds.includes(s.id)).length;
                                                    return pastSessions.length - presentCount;
                                                })()}
                                            </h3>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col sm={4}>
                                    <Card className="h-100 shadow-sm border-0 border-start border-info border-4">
                                        <Card.Body>
                                            <div className="text-secondary small mb-1">Total Sessions</div>
                                            <h3 className="fw-bold text-dark mb-0">
                                                {sessions.filter(s => s.status === 'EXPIRED').length}
                                            </h3>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col sm={12}>
                                    <Card className="h-100 shadow-sm border-0">
                                        <Card.Body className="d-flex align-items-center justify-content-between">
                                            <div>
                                                <div className="text-secondary small">Last Marked Date</div>
                                                <div className="fw-bold">
                                                    {(() => {
                                                        const markedSessions = sessions
                                                            .filter(s => markedSessionIds.includes(s.id))
                                                            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
                                                        return markedSessions.length > 0 
                                                            ? new Date(markedSessions[0].startTime).toLocaleDateString() + " " + new Date(markedSessions[0].startTime).toLocaleTimeString()
                                                            : "N/A";
                                                    })()}
                                                </div>
                                            </div>
                                            <div className="text-success bg-success bg-opacity-10 p-2 rounded-circle">
                                                <i className="bi bi-calendar-check fs-4"></i>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
            )}

            <h4 className="mb-3">Sessions Details</h4>
            <Tabs defaultActiveKey="active" className="mb-3">
                <Tab eventKey="active" title={`Active (${categorizeSessions('ACTIVE').length})`}>
                    <Row className="g-3">
                        {categorizeSessions('ACTIVE').length === 0 && <Col><p className="text-muted">No active sessions.</p></Col>}
                        {categorizeSessions('ACTIVE').map(session => (
                            <Col md={6} key={session.id}>
                                <Card border="success">
                                    <Card.Body>
                                        <Card.Title>{session.title}</Card.Title>
                                        <Card.Text>
                                            <strong>Time:</strong> {new Date(session.startTime).toLocaleString()} - {new Date(session.endTime).toLocaleTimeString()}
                                        </Card.Text>
                                        {markedSessionIds.includes(session.id) ? (
                                            <Button variant="secondary" disabled>
                                                Marked
                                            </Button>
                                        ) : (
                                            <Button 
                                                variant="success" 
                                                onClick={() => markAttendance(session.id)}
                                                disabled={markingSessionId === session.id}
                                            >
                                                {markingSessionId === session.id ? (
                                                    <>
                                                        <Spinner
                                                            as="span"
                                                            animation="border"
                                                            size="sm"
                                                            role="status"
                                                            aria-hidden="true"
                                                            className="me-2"
                                                        />
                                                        Marking...
                                                    </>
                                                ) : (
                                                    'Mark Attendance'
                                                )}
                                            </Button>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Tab>
                <Tab eventKey="scheduled" title={`Scheduled (${categorizeSessions('SCHEDULED').length})`}>
                     <Row className="g-3">
                        {categorizeSessions('SCHEDULED').length === 0 && <Col><p className="text-muted">No scheduled sessions.</p></Col>}
                        {categorizeSessions('SCHEDULED').map(session => (
                            <Col md={6} key={session.id}>
                                <Card>
                                    <Card.Body>
                                        <Card.Title>{session.title}</Card.Title>
                                        <Card.Text>
                                            <strong>Starts:</strong> {new Date(session.startTime).toLocaleString()}
                                        </Card.Text>
                                        <div className="mb-2">
                                            <Countdown targetDate={session.startTime} onComplete={fetchData} />
                                        </div>
                                        <Badge bg="warning" text="dark">Scheduled</Badge>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Tab>
                <Tab eventKey="expired" title="History">
                    <Row className="g-3">
                        {categorizeSessions('EXPIRED').length === 0 && <Col><p className="text-muted">No past sessions.</p></Col>}
                         {categorizeSessions('EXPIRED').map(session => (
                            <Col md={6} key={session.id}>
                                <Card 
                                    className="bg-light text-muted h-100" 
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleHistoryClick(session)}
                                >
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <Card.Title>{session.title}</Card.Title>
                                                <Card.Text>
                                                    Ended: {new Date(session.endTime).toLocaleString()}
                                                </Card.Text>
                                            </div>
                                            {markedSessionIds.includes(session.id) && (
                                                <i className="bi bi-check-circle-fill text-success" title="Attended"></i>
                                            )}
                                        </div>
                                        <Badge bg="secondary">Expired</Badge>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Tab>
            </Tabs>

            {/* Unenroll Confirmation Modal */}
            <Modal show={showUnenrollModal} onHide={() => setShowUnenrollModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Unenrollment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to unenroll from <strong>{course.name}</strong>?
                    <br />
                    <span className="text-danger small">You will lose access to all session history for this course.</span>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowUnenrollModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleUnenroll}>
                        Yes, Unenroll
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* History Status Modal */}
            <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Attendance Status</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    {selectedHistorySession && (
                        <>
                            <h5 className="mb-3">{selectedHistorySession.title}</h5>
                            <p className="text-muted mb-4">
                                {new Date(selectedHistorySession.startTime).toLocaleString()}
                            </p>
                            
                            {markedSessionIds.includes(selectedHistorySession.id) ? (
                                <div className="text-success">
                                    <i className="bi bi-check-circle-fill" style={{ fontSize: '4rem' }}></i>
                                    <h4 className="mt-3">Present</h4>
                                    <p>You marked attendance for this session.</p>
                                </div>
                            ) : (
                                <div className="text-danger">
                                    <i className="bi bi-x-circle-fill" style={{ fontSize: '4rem' }}></i>
                                    <h4 className="mt-3">Absent</h4>
                                    <p>No attendance record found.</p>
                                </div>
                            )}
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                     <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/* Success Modal */}
            <Modal show={showSuccessModal} onHide={() => {}} centered backdrop="static" keyboard={false}>
                <Modal.Header>
                    <Modal.Title>Success</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center text-success mb-3">
                        <i className="bi bi-check-circle-fill" style={{ fontSize: '3rem' }}></i>
                    </div>
                    <p className="text-center">You have successfully unenrolled from <strong>{course.name}</strong>.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => {
                        setShowSuccessModal(false);
                        navigate('/student-dashboard');
                    }}>
                        OK
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default StudentCourseDetails;
