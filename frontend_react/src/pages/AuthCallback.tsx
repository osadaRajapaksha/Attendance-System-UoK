import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Container, Alert, Spinner, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useAuthContext } from "@asgardeo/auth-react";
import uokLogo from '../assets/Attendance_system_uok.png';

const AuthCallback: React.FC = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // States for first-time login
  const [showStudentIdForm, setShowStudentIdForm] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [degreeProgram, setDegreeProgram] = useState('');
  const [faculty, setFaculty] = useState('');
  const [department, setDepartment] = useState('');

  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const { state, getIDToken } = useAuthContext();

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
          
          const { token, deviceToken, role, fullName, studentId: respStudentId, teacherId, adminId, degreeProgram: respDegree, faculty: respFaculty, email: responseEmail } = data;

          const existingDeviceToken = localStorage.getItem('device_token');
          if (!existingDeviceToken && deviceToken) {
            localStorage.setItem('device_token', deviceToken);
          }

          auth?.login({
            token,
            email: responseEmail,
            role,
            fullName,
            studentId: respStudentId,
            teacherId,
            adminId,
            degreeProgram: respDegree,
            faculty: respFaculty
          });

          if (role === 'ROLE_STUDENT') navigate('/student-dashboard');
          else if (role === 'ROLE_TEACHER') navigate('/teacher-dashboard');
          else if (role === 'ROLE_ADMIN') navigate('/admin-dashboard');
          else navigate('/');

        } catch (err: any) {
          console.error(err);
          if (err.response?.data?.message === 'User not registered in the system' || 
              err.response?.data?.message?.includes('User not registered') ||
              err.response?.status === 400 || err.response?.status === 404 || err.response?.status === 500) {
            setShowStudentIdForm(true);
            setError('Please complete your profile by providing your Student ID and details.');
          } else {
            setError('Asgardeo Login Failed. Please try again.');
          }
        } finally {
          setLoading(false);
        }
      } else if (!state.isAuthenticated && !state.isLoading) {
        // If they reached callback but are not authenticated in Asgardeo, redirect to login
        navigate('/login');
      }
    };
    
    if (!state.isLoading) {
      handleAsgardeoLogin();
    }
  }, [state.isAuthenticated, state.isLoading, auth, navigate, getIDToken]);


  const handleStudentIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const idToken = await getIDToken();
      const payload: any = { 
        token: idToken,
        studentId,
        degreeProgram,
        faculty,
        department
      };

      const response = await api.post('/api/auth/asgardeo-register', payload);
      const data = response.data;

      const { token, deviceToken, role, fullName, studentId: respStudentId, teacherId, adminId, degreeProgram: respDegree, faculty: respFaculty, email: responseEmail } = data;

      const existingDeviceToken = localStorage.getItem('device_token');
      if (!existingDeviceToken && deviceToken) {
        localStorage.setItem('device_token', deviceToken);
      }

      auth?.login({
        token,
        email: responseEmail,
        role,
        fullName,
        studentId: respStudentId,
        teacherId,
        adminId,
        degreeProgram: respDegree,
        faculty: respFaculty
      });

      if (role === 'ROLE_STUDENT') navigate('/student-dashboard');
      else if (role === 'ROLE_TEACHER') navigate('/teacher-dashboard');
      else if (role === 'ROLE_ADMIN') navigate('/admin-dashboard');
      else navigate('/');

    } catch (err: any) {
      console.error(err);
      setError('Registration failed. Please check your details and try again.');
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

          {error && <Alert variant={showStudentIdForm ? "info" : "danger"} className="mt-3">{error}</Alert>}
          
          {!showStudentIdForm ? (
            <div className="mt-4 text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Authenticating, please wait...</p>
            </div>
          ) : (
            <Form onSubmit={handleStudentIdSubmit} className="mt-4">
              <Form.Group className="mb-3" controlId="formStudentId">
                <Form.Label>Student ID</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. EC/2021/071"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formFaculty">
                <Form.Label>Faculty</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. Science"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formDepartment">
                <Form.Label>Department</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="formDegree">
                <Form.Label>Degree Program</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. BSc Hons in Computer Science"
                  value={degreeProgram}
                  onChange={(e) => setDegreeProgram(e.target.value)}
                />
              </Form.Group>

              <Button variant="success" type="submit" className="w-100 py-2" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Complete Registration'}
              </Button>
            </Form>
          )}

        </Card.Body>
      </Card>
    </Container>
  );
};

export default AuthCallback;
