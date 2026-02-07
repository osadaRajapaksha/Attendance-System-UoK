import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Container, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, deviceToken, role, fullName, studentId, teacherId, adminId, degreeProgram, faculty } = response.data;
      
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
      setError('Invalid email or password');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="w-100" style={{ maxWidth: '400px' }}>
        <h2 className="text-center mb-4">Login</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control 
              type="email" 
              placeholder="Enter email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : 'Login'}
          </Button>
          <div className="text-end mt-2">
            <Link to="/forgot-password" style={{ fontSize: '0.9rem' }}>Forgot Password?</Link>
          </div>
        </Form>
        <div className="w-100 text-center mt-3">
          Need an account? <Link to="/register">Sign Up</Link>
        </div>
      </div>
    </Container>
  );
};

export default Login;
