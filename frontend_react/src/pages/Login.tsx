import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Container, Alert, Spinner, Card } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useAuthContext } from "@asgardeo/auth-react";
import uokLogo from '../assets/Attendance_system_uok.png';

const Login: React.FC = () => {
  const [studentNumber, setStudentNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const { state: asgardeoState, signIn, getAccessToken, getBasicUserInfo, signOut } = useAuthContext();

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
      if (asgardeoState.isAuthenticated && !auth?.isAuthenticated) {
        setLoading(true);
        try {
          const userInfo = await getBasicUserInfo();
          const accessToken = await getAccessToken();
          
          const savedStudentNumber = localStorage.getItem('pending_student_number') || '';
          
          const response = await api.post('/api/auth/asgardeo-login', {
             studentNumber: savedStudentNumber,
             email: userInfo.email || userInfo.username,
             asgardeoToken: accessToken
          });
          
          const data = response.data;
          const { token: backendToken, deviceToken, role, fullName, studentId, teacherId, adminId, degreeProgram, faculty } = data;
          
          const existingDeviceToken = localStorage.getItem('device_token');
          if (!existingDeviceToken && deviceToken) {
            localStorage.setItem('device_token', deviceToken);
          }
          
          auth?.login({
            token: backendToken,
            email: userInfo.email || userInfo.username || '',
            role,
            fullName,
            studentId,
            teacherId,
            adminId,
            degreeProgram,
            faculty
          });
          
          localStorage.removeItem('pending_student_number');
          
        } catch (err: any) {
          console.error("Backend login sync failed:", err);
          setError(err.response?.data?.message || "Failed to sync login with backend. User may not exist or invalid details.");
          signOut();
        } finally {
          setLoading(false);
        }
      }
    };
    
    handleAsgardeoLogin();
  }, [asgardeoState.isAuthenticated, auth?.isAuthenticated, getBasicUserInfo, signOut, auth]);

  const handleLoginClick = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (studentNumber) {
      localStorage.setItem('pending_student_number', studentNumber);
    } else {
      localStorage.removeItem('pending_student_number');
    }
    signIn();
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '100%', maxWidth: '500px' }} className="shadow">
        <Card.Body>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img src={uokLogo} alt="University Logo" style={{ maxWidth: '400px', height: 'auto',width:'80%' }} />
          </div>
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
          
          <Form onSubmit={handleLoginClick} className="mt-3">
            <Form.Group className="mb-4 mt-4" controlId="formStudentNumber">
              <Form.Label>Student Number (For Students)</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. EC/2021/071"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
              />
              <Form.Text className="text-muted">
                Teachers and Admins can leave this blank.
              </Form.Text>
            </Form.Group>

            <Button variant="danger" type="submit" className="w-100" disabled={loading || asgardeoState.isLoading}>
              {loading || asgardeoState.isLoading ? <Spinner animation="border" size="sm" /> : <><i className="bi bi-google me-2"></i> Login with Google (Asgardeo)</>}
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
