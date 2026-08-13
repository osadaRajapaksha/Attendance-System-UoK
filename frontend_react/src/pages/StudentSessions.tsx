import React, { useState, useEffect } from 'react';
import { Container, Tabs, Tab, Card, Button, Modal, Spinner } from 'react-bootstrap';
import api from '../api/axios';

const StudentSessions: React.FC = () => {
    const [sessions, setSessions] = useState<any[]>([]);


    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await api.get('/api/sessions/student');
            setSessions(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const [markingSessionId, setMarkingSessionId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [attendanceStatus, setAttendanceStatus] = useState<'idle' | 'marking' | 'success' | 'error'>('idle');
    const [modalMsg, setModalMsg] = useState('');

    const markAttendance = async (sessionId: string) => {
        setMarkingSessionId(sessionId);
        setAttendanceStatus('marking');
        setModalMsg('Fetching your location...');
        setShowModal(true);

        if (!navigator.geolocation) {
            setAttendanceStatus('error');
            setModalMsg('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            setModalMsg('Verifying location and marking attendance...');
            try {
                await api.post('/api/sessions/mark', {
                    sessionId,
                    lat: latitude,
                    lng: longitude
                });
                setAttendanceStatus('success');
                setModalMsg('Attendance Marked Successfully!');
            } catch (err: any) {
                setAttendanceStatus('error');
                setModalMsg(err.response?.data?.message || 'Failed to mark attendance');
            }
        }, () => {
            setAttendanceStatus('error');
            setModalMsg('Unable to retrieve your location');
        });
    };

    const activeSessions = sessions.filter(s => s.status === 'ACTIVE');
    const scheduledSessions = sessions.filter(s => s.status === 'SCHEDULED');
    const expiredSessions = sessions.filter(s => s.status === 'EXPIRED');

    const SessionCard = ({ session, showMark }: { session: any, showMark: boolean }) => (
        <Card className="mb-3">
            <Card.Body>
                <Card.Title>{session.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                    {new Date(session.startTime).toLocaleString()} - {new Date(session.endTime).toLocaleString()}
                </Card.Subtitle>
                {showMark && (
                    <Button 
                        variant="success" 
                        onClick={() => markAttendance(session.id)}
                        disabled={markingSessionId === session.id}
                    >
                        {markingSessionId === session.id ? 'Marking...' : 'Mark Attendance'}
                    </Button>
                )}
            </Card.Body>
        </Card>
    );

    return (
        <Container className="mt-4">
            <h2>My Sessions</h2>
            
            <Tabs defaultActiveKey="active" className="mb-3">
                <Tab eventKey="active" title={`Active (${activeSessions.length})`}>
                     {activeSessions.length === 0 && <p>No active sessions.</p>}
                     {activeSessions.map(s => <SessionCard key={s.id} session={s} showMark={true} />)}
                </Tab>
                <Tab eventKey="scheduled" title={`Scheduled (${scheduledSessions.length})`}>
                     {scheduledSessions.map(s => <SessionCard key={s.id} session={s} showMark={false} />)}
                </Tab>
                <Tab eventKey="expired" title="Expired/History">
                     {expiredSessions.map(s => <SessionCard key={s.id} session={s} showMark={false} />)}
                </Tab>
            </Tabs>

            <Modal show={showModal} onHide={() => {
                if (attendanceStatus !== 'marking') {
                    setShowModal(false);
                    setMarkingSessionId(null);
                }
            }} centered backdrop="static" keyboard={false}>
                <Modal.Header closeButton={attendanceStatus !== 'marking'}>
                    <Modal.Title>
                        {attendanceStatus === 'marking' && 'Marking Attendance'}
                        {attendanceStatus === 'success' && 'Success'}
                        {attendanceStatus === 'error' && 'Error'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center py-4">
                    {attendanceStatus === 'marking' && (
                        <>
                            <Spinner animation="border" variant="primary" className="mb-3" />
                            <p>{modalMsg}</p>
                        </>
                    )}
                    {attendanceStatus === 'success' && (
                        <>
                            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
                            <p className="mt-3 fs-5">{modalMsg}</p>
                        </>
                    )}
                    {attendanceStatus === 'error' && (
                        <>
                            <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: '3rem' }}></i>
                            <p className="mt-3 fs-5">{modalMsg}</p>
                        </>
                    )}
                </Modal.Body>
                {attendanceStatus !== 'marking' && (
                    <Modal.Footer>
                        <Button variant={attendanceStatus === 'success' ? 'success' : 'secondary'} onClick={() => {
                            setShowModal(false);
                            setMarkingSessionId(null);
                            if (attendanceStatus === 'success') {
                                fetchSessions(); // Refresh after success
                            }
                        }}>
                            Close
                        </Button>
                    </Modal.Footer>
                )}
            </Modal>
        </Container>
    );
}

export default StudentSessions;
