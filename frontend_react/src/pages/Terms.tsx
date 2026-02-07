import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Terms: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', padding: '2rem 0 4rem 0' }}>
             <Card style={{ width: '100%', maxWidth: '800px' }} className="shadow">
                <Card.Body>
                    <h2 className="text-center mb-4">Terms and Conditions</h2>
                    <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', marginBottom: '20px' }}>
                        <h5>1. Acceptance of Terms</h5>
                        <p>By accessing and using this Attendance System, you accept and agree to be bound by the terms and provision of this agreement.</p>

                        <h5>2. Use License</h5>
                        <p>Permission is granted to temporarily download one copy of the materials (information or software) on University of Kelaniya's website for personal, non-commercial transitory viewing only.</p>
                        
                        <h5>3. Disclaimer</h5>
                        <p>The materials on University of Kelaniya's website are provided "as is". University of Kelaniya makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties, including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
                        
                        <h5>4. Limitations</h5>
                        <p>In no event shall University of Kelaniya or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on University of Kelaniya's website.</p>
                        
                        <h5>5. Accuracy of Materials</h5>
                        <p>The materials appearing on University of Kelaniya's website could include technical, typographical, or photographic errors. University of Kelaniya does not warrant that any of the materials on its website are accurate, complete or current.</p>

                        <h5>6. User Account</h5>
                        <p>You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer, and you agree to accept responsibility for all activities that occur under your account or password.</p>
                    </div>
                    <div className="text-center">
                        <Button variant="secondary" onClick={() => window.close()} className="me-2">Close Tab</Button>
                        <Button variant="primary" onClick={() => navigate('/login')}>Back to Login</Button>
                    </div>
                </Card.Body>
             </Card>
        </Container>
    );
};

export default Terms;
