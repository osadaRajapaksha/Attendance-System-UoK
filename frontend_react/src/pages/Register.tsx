import React, { useState } from 'react';
import { Form, Button, Container, Alert, Spinner, ProgressBar, Card } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const calculateStrength = (password: string) => {
  let score = 0;
  if (password.length >= 6) score += 20;
  if (password.length >= 10) score += 20;
  if (/[A-Z]/.test(password)) score += 20;
  if (/[0-9]/.test(password)) score += 20;
  if (/[^A-Za-z0-9]/.test(password)) score += 20;

  if (score < 40) return { score, variant: 'danger', label: 'Weak' };
  if (score < 80) return { score, variant: 'warning', label: 'Medium' };
  return { score, variant: 'success', label: 'Strong' };
};

const Register: React.FC = () => {
  const navigate = useNavigate();

  const faculties = ["Science", "FCMS", "Arts", "FCT"];
  const scienceDegreePrograms = [
    "Electronics and Computer Science", "Physics and Electronics", "Management and Information Technology", "Applied Chemistry",
    "Physical Science", "Bio Science", "Environmental and Conservation Management", "Sport Science", "Software Engineering",
  ];

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    studentId: '',
    password: '',
    faculty: 'Science',
    degreeProgram: '',
    agreeToTerms: false
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic Validation matching legacy logic

    if (!formData.studentId) {
      setError("Please enter your Student Number.");
      return;
    }

    // Basic Validation matching legacy logic
    if (formData.faculty === "Science" && !formData.degreeProgram) {
      setError("Select degree program");
      setLoading(false);
      return;
    }



    try {
      setLoading(true);
      await api.post('/api/auth/register', formData);
      setSuccess('Registration successful! Redirecting to login...');
      
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', paddingTop: '2rem', paddingBottom: '2rem' }}>
      <Card style={{ width: '100%', maxWidth: '500px' }} className="shadow">
        <Card.Body>
          <h2 className="text-center mb-4">Register</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Student Number</Form.Label>
              <Form.Control
                type="text"
                name="studentId"
                placeholder="Student Number (e.g., EC/2021/071)"
                value={formData.studentId}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {formData.password && (
                <div className="mt-2">
                  <ProgressBar
                    now={calculateStrength(formData.password).score}
                    variant={calculateStrength(formData.password).variant}
                    style={{ height: '5px' }}
                  />
                  <Form.Text className="text-muted">
                    Strength: <span className={`text-${calculateStrength(formData.password).variant}`}>
                      {calculateStrength(formData.password).label}
                    </span>
                  </Form.Text>
                </div>
              )}
            </Form.Group>





            <Form.Group className="mb-3">
              <Form.Label>Faculty</Form.Label>
              <Form.Select
                name="faculty"
                value={formData.faculty}
                onChange={handleChange}
              >
                {faculties.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Degree Program</Form.Label>
              <Form.Select
                name="degreeProgram"
                value={formData.degreeProgram}
                onChange={handleChange}
                disabled={formData.faculty !== "Science"}
              >
                <option value="">Select Degree Program</option>
                {scienceDegreePrograms.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Form.Select>
              {formData.faculty !== "Science" && <Form.Text className="text-muted">Only available for Science faculty currently.</Form.Text>}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label={<span>I agree to the <Link to="/terms" target="_blank" className="custom-link">Terms and Conditions</Link></span>}
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Register'}
            </Button>
          </Form>
          <div className="w-100 text-center mt-3">
            Already have an account? <Link to="/login" className="custom-link">Login</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Register;
