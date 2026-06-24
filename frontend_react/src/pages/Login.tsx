import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Container, Alert, Spinner, Card } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useAuthContext } from "@asgardeo/auth-react";
import uokLogo from '../assets/Attendance_system_uok.png';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const { signIn, state, getIDToken } = useAuthContext();

  useEffect(() => {
    if (auth?.isAuthenticated && auth?.user) {
      const { role } = auth.user;
      if (role === 'ROLE_STUDENT') navigate('/student-dashboard');
      else if (role === 'ROLE_TEACHER') navigate('/teacher-dashboard');
      else if (role === 'ROLE_ADMIN') navigate('/admin-dashboard');
    }
  }, [auth, navigate]);

  useEffect(() => {
    const handleAsgardeoLogin = async () => {
      if (state.isAuthenticated && !auth?.isAuthenticated) {
        try {
          setLoading(true);
          const idToken = await getIDToken();
          
          const response = await api.post('/api/auth/asgardeo-login', { token: idToken });
          const data = response.data;
          
          const { token, deviceToken, role, fullName, studentId, teacherId, adminId, degreeProgram, faculty, email: responseEmail } = data;

          const existingDeviceToken = localStorage.getItem('device_token');
          if (!existingDeviceToken && deviceToken) {
            localStorage.setItem('device_token', deviceToken);
          }

          auth?.login({
            token,
            email: responseEmail,
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
          setError('Asgardeo Login Failed. User may not be registered in the system.');
        } finally {
          setLoading(false);
        }
      }
    };
    handleAsgardeoLogin();
  }, [state.isAuthenticated, auth, navigate, getIDToken]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload: any = { email, password };

      const response = await api.post('/api/auth/login', payload);
      const data = response.data;

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
        setError('Invalid email or password');
      } else {
        setError('Network Error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>

      <Card style={{ width: '100%', maxWidth: '500px' }} className="shadow">
        <Card.Body>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
  <img
    src={uokLogo}
    alt="University Logo"
    style={{ maxWidth: '400px', height: 'auto',width:'80%' }}
  />
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
              />
            </Form.Group>


            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Login'}
            </Button>
            
            <div className="d-flex align-items-center my-3">
              <hr className="flex-grow-1" />
              <span className="mx-2 text-muted">OR</span>
              <hr className="flex-grow-1" />
            </div>
            <Button 
              variant="outline-dark" 
              className="w-100 d-flex align-items-center justify-content-center" 
              onClick={(e) => { e.preventDefault(); signIn(); }}
              disabled={loading}
            >
              <img src="https://asgardeo.io/theme/images/favicon.ico" alt="Asgardeo" style={{width: '20px', marginRight: '10px'}} />
              Continue with Asgardeo
            </Button>

            <div className="text-end mt-3">
              <Link to="/forgot-password" className="custom-link fw-bold" style={{ fontSize: '0.9rem' }}>Forgot Password?</Link>
            </div>
          </Form>
          <div className="w-100 text-center mt-3">
            Need an account? <Link to="/register" className="custom-link">Sign Up</Link>
          </div>
        </Card.Body>
      </Card>

    </Container>
  );
};

export default Login;
