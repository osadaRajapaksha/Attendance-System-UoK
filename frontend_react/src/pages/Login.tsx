import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Container, Alert, Spinner, Card } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import uokLogo from '../assets/Attendance_system_uok.png';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (auth?.isAuthenticated && auth?.user) {
      const { role } = auth.user;
      if (role === 'ROLE_STUDENT') navigate('/student-dashboard');
      else if (role === 'ROLE_TEACHER') navigate('/teacher-dashboard');
      else if (role === 'ROLE_ADMIN') navigate('/admin-dashboard');
    }
  }, [auth, navigate]);

  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload: any = { email, password };
      if (showOtp) payload.otp = otp;

      const response = await api.post('/api/auth/login', payload);
      const data = response.data;

      // Check if 2FA is required
      if (data.requiresTwoFactor) {
        setShowOtp(true);
        setLoading(false);
        return;
      }

      const { token, deviceToken, role, fullName, studentId, teacherId, adminId, degreeProgram, faculty } = data;

      // Device Lock Anti-Fraud
      const existingDeviceToken = localStorage.getItem('device_token');
      if (!existingDeviceToken && deviceToken) {
        localStorage.setItem('device_token', deviceToken);
      }

      auth?.login({
        token,
        email,
        role,
        fullName,
        studentId,
        teacherId,
        adminId,
        degreeProgram,
        faculty
      });

      if (role === 'ROLE_STUDENT') navigate('/student-dashboard');
      else if (role === 'ROLE_TEACHER') navigate('/teacher-dashboard');
      else if (role === 'ROLE_ADMIN') navigate('/admin-dashboard');
      else navigate('/');

    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Invalid email or password');
      }
    } finally {
      if (!showOtp) setLoading(false); // Only stop loading if not switching to OTP mode
      else setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>

      <Card style={{ width: '100%', maxWidth: '500px' }} className="shadow">
        <Card.Body>
          <div className="text-center mb-4">
            <img src={uokLogo} alt="University Logo" style={{ maxWidth: '400px', height: 'auto' }} />
          </div>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={showOtp}
              />
            </Form.Group>

            {showOtp && (
              <Form.Group className="mb-3" controlId="formBasicOtp">
                <Form.Label>One-Time Password (OTP)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter OTP sent to your email"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <Form.Text className="text-muted">
                  Check your email for the 6-digit code.
                </Form.Text>
              </Form.Group>
            )}
            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Login'}
            </Button>
            <div className="text-end mt-3">
              <Link to="/forgot-password" style={{ fontSize: '0.9rem' }}>Forgot Password?</Link>
            </div>
          </Form>
          <div className="w-100 text-center mt-3">
            Need an account? <Link to="/register">Sign Up</Link>
          </div>
        </Card.Body>
      </Card>

    </Container>
  );
};

export default Login;
