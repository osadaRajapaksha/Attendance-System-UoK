import React, { useState } from 'react';
import { Container, Button, Form, Alert, Card } from 'react-bootstrap';
import api from '../api/axios';

const AdminDashboard: React.FC = () => {
  const [teacherData, setTeacherData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'ROLE_TEACHER'
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTeacherData({...teacherData, [e.target.name]: e.target.value});
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/api/teachers/add', teacherData);
      setSuccess('Teacher created successfully');
      setTeacherData({
        username: '',
        email: '',
        password: '',
        fullName: '',
        role: 'ROLE_TEACHER'
      });
    } catch (err) {
      console.error(err);
      setError('Failed to create teacher');
    }
  };

  return (
    <Container className="mt-4">
      <h2>Admin Dashboard</h2>
      <Card className="mt-3 p-4 shadow-sm" style={{ maxWidth: '600px' }}>
        <h4>Create New Teacher</h4>
        {success && <Alert variant="success">{success}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleCreateTeacher}>
           <Form.Group className="mb-3">
            <Form.Label>Description / FullName</Form.Label>
            <Form.Control type="text" name="fullName" value={teacherData.fullName} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control type="text" name="username" value={teacherData.username} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" name="email" value={teacherData.email} onChange={handleChange} required />
          </Form.Group>
           <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" name="password" value={teacherData.password} onChange={handleChange} required />
          </Form.Group>
          <Button variant="primary" type="submit">Create Teacher</Button>
        </Form>
      </Card>
      
      {/* Can add User Management List here in future */}
    </Container>
  );
};

export default AdminDashboard;
