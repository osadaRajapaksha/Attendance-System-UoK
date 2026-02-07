import { useEffect, useState } from 'react';
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import api from '../api/axios';

const DashboardStats = () => {
    const [stats, setStats] = useState({ teachers: 0, students: 0, courses: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/api/admin/stats')
            .then(res => setStats(res.data))
            .catch(err => {
                console.error(err);
                setError('Failed to load dashboard statistics');
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>;
    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <div className="animate__animated animate__fadeIn">
            <h4 className="mb-4 text-muted">Overview</h4>
            <Row className="g-4 mb-4">
                <Col md={4}>
                    <Card className="border-0 shadow-sm h-100 overflow-hidden" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <Card.Body className="p-4 text-white d-flex align-items-center justify-content-between">
                            <div>
                                <h6 className="text-uppercase mb-2 opacity-75 fw-bold" style={{ letterSpacing: '1px' }}>Total Students</h6>
                                <h2 className="display-4 fw-bold mb-0">{stats.students}</h2>
                            </div>
                            <div className="bg-white bg-opacity-25 rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                <i className="bi bi-people-fill fs-1 text-white"></i>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                
                <Col md={4}>
                    <Card className="border-0 shadow-sm h-100 overflow-hidden" style={{ background: 'linear-gradient(135deg, #2af598 0%, #009efd 100%)' }}>
                        <Card.Body className="p-4 text-white d-flex align-items-center justify-content-between">
                            <div>
                                <h6 className="text-uppercase mb-2 opacity-75 fw-bold" style={{ letterSpacing: '1px' }}>Active Teachers</h6>
                                <h2 className="display-4 fw-bold mb-0">{stats.teachers}</h2>
                            </div>
                            <div className="bg-white bg-opacity-25 rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                <i className="bi bi-person-video3 fs-1 text-white"></i>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="border-0 shadow-sm h-100 overflow-hidden" style={{ background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)' }}>
                        <Card.Body className="p-4 text-white d-flex align-items-center justify-content-between">
                            <div>
                                <h6 className="text-uppercase mb-2 opacity-75 fw-bold" style={{ letterSpacing: '1px' }}>Total Courses</h6>
                                <h2 className="display-4 fw-bold mb-0">{stats.courses}</h2>
                            </div>
                            <div className="bg-white bg-opacity-25 rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                <i className="bi bi-journal-text fs-1 text-white"></i>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardStats;
