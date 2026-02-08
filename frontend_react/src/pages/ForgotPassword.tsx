import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', content: '' });
    const navigate = useNavigate();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ type: '', content: '' });

        try {
            await api.post('/api/otp/send', { email, isForgotPassword: 'true' });
            setMsg({ type: 'success', content: 'OTP sent to your email.' });
            setStep(2);
        } catch (err: any) {
            setMsg({ type: 'danger', content: err.response?.data?.message || err.response?.data || 'Failed to send OTP.' });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMsg({ type: 'danger', content: 'Passwords do not match' });
            return;
        }

        setLoading(true);
        setMsg({ type: '', content: '' });

        try {
            await api.post('/api/auth/reset-password', { email, otp, newPassword });
            setMsg({ type: 'success', content: 'Password reset successfully!' });
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            setMsg({ type: 'danger', content: err.response?.data?.message || 'Failed to reset password.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <Card style={{ width: '100%', maxWidth: '500px' }} className="shadow">
                <Card.Body>
                    <h3 className="text-center mb-4">Forgot Password</h3>
                    {msg.content && <Alert variant={msg.type} dismissible onClose={() => setMsg({ type: '', content: '' })}>{msg.content}</Alert>}

                    {step === 1 ? (
                        <Form onSubmit={handleSendOtp}>
                            <Form.Group className="mb-3">
                                <Form.Label>Enter your Email</Form.Label>
                                <Form.Control 
                                    type="email" 
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    required 
                                    placeholder="e.g. name@kln.ac.lk"
                                />
                                <Form.Text className="text-muted">
                                    We will send an OTP to this email if it is registered.
                                </Form.Text>
                            </Form.Group>
                            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                                {loading ? <Spinner animation="border" size="sm" /> : 'Send OTP'}
                            </Button>
                        </Form>
                    ) : (
                        <Form onSubmit={handleResetPassword}>
                            <Form.Group className="mb-3">
                                <Form.Label>OTP Code</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    value={otp} 
                                    onChange={e => setOtp(e.target.value)} 
                                    required 
                                    placeholder="Enter 6-digit OTP"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>New Password</Form.Label>
                                <Form.Control 
                                    type="password" 
                                    value={newPassword} 
                                    onChange={e => setNewPassword(e.target.value)} 
                                    required 
                                    // Removed minLength as requested
                                />
                                {newPassword && (
                                    <Form.Text muted>
                                        Strength: <span style={{ 
                                            fontWeight: 'bold',
                                            color: newPassword.length < 6 ? 'red' : (newPassword.length < 10 ? 'orange' : 'green') 
                                        }}>
                                            {newPassword.length < 6 ? 'Weak' : (newPassword.length < 10 ? 'Good' : 'Strong')}
                                        </span>
                                    </Form.Text>
                                )}
                            </Form.Group>
                             <Form.Group className="mb-3">
                                <Form.Label>Confirm Password</Form.Label>
                                <Form.Control 
                                    type="password" 
                                    value={confirmPassword} 
                                    onChange={e => setConfirmPassword(e.target.value)} 
                                    required 
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit" className="w-100 mb-2" disabled={loading}>
                                {loading ? <Spinner animation="border" size="sm" /> : 'Reset Password'}
                            </Button>
                            {/* "Change Email" option removed as requested */}
                        </Form>
                    )}

                    <div className="text-center mt-3">
                        <Link to="/login" className="custom-link">Back to Login</Link>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ForgotPassword;
