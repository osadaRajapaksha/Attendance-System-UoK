import React, { useState, useEffect } from 'react';
import { Container, Button, Form, Alert, Card, Tabs, Tab, Table, Badge, Row, Col, Spinner, InputGroup } from 'react-bootstrap';
import api from '../api/axios';

const AdminDashboard: React.FC = () => {
    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Admin Dashboard</h2>
                <Button variant="outline-primary" onClick={() => window.location.reload()}>Refresh</Button>
            </div>
            
            <Tabs defaultActiveKey="students" className="mb-4">
                <Tab eventKey="teachers" title="Manage Teachers">
                    <TeacherManager />
                </Tab>
                <Tab eventKey="courses" title="Manage Courses">
                    <CourseManager />
                </Tab>
                <Tab eventKey="students" title="Manage Students">
                    <StudentManager />
                </Tab>
                <Tab eventKey="settings" title="System Settings">
                    <Card className="p-4 shadow-sm" style={{ maxWidth: '600px' }}>
                        <h4 className="mb-3">System Settings</h4>
                        <TimezoneSettings />
                    </Card>
                </Tab>
            </Tabs>
        </Container>
    );
};

const TeacherManager = () => {
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
        setTeacherData({ ...teacherData, [e.target.name]: e.target.value });
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
            setError('Failed to creating teacher');
        }
    };

    return (
        <Row>
            <Col md={6}>
                 <Card className="p-4 shadow-sm h-100">
                    <h4 className="mb-3">Create New Teacher</h4>
                    {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
                    {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
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
            </Col>
            <Col md={6}>
                {/* List of teachers could go here if needed */}
                <Card className="p-4 shadow-sm h-100 d-flex justify-content-center align-items-center text-muted">
                    <p>Teacher list not yet implemented.</p>
                </Card>
            </Col>
        </Row>
    );
};

interface Course {
    id: string;
    name: string;
    code: string;
    teacherName: string;
}

const CourseManager = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]); // simplified for now
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', content: '' });
    
    // Create Form State
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        teacherId: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [coursesRes, usersRes] = await Promise.all([
                api.get('/api/courses'),
                api.get('/api/admin/all')
            ]);
            setCourses(coursesRes.data);
            setTeachers(usersRes.data.filter((u: any) => u.role === 'ROLE_TEACHER'));
        } catch (err) {
            console.error(err);
            setMsg({ type: 'danger', content: 'Failed to fetch data' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | any>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg({ type: '', content: '' });
        try {
            await api.post(`/api/courses/admin/create?teacherId=${formData.teacherId}`, {
                name: formData.name,
                code: formData.code
            });
            setMsg({ type: 'success', content: 'Course created successfully' });
            setFormData({ name: '', code: '', teacherId: '' });
            fetchData();
        } catch (err: any) {
            console.error(err);
            setMsg({ type: 'danger', content: err.response?.data?.message || 'Failed to create course' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this course?")) return;
        try {
            await api.delete(`/api/courses/${id}`);
            setCourses(prev => prev.filter(c => c.id !== id));
            setMsg({ type: 'success', content: 'Course deleted successfully' });
        } catch (err) {
            console.error(err);
            setMsg({ type: 'danger', content: 'Failed to delete course' });
        }
    };

    return (
        <Row>
            <Col lg={4} className="mb-4">
                 <Card className="shadow-sm">
                    <Card.Header className="bg-primary text-white">Create New Course</Card.Header>
                    <Card.Body>
                        {msg.content && <Alert variant={msg.type} dismissible onClose={() => setMsg({ type: '', content: '' })}>{msg.content}</Alert>}
                        <Form onSubmit={handleCreateCourse}>
                            <Form.Group className="mb-2">
                                <Form.Label>Course Name</Form.Label>
                                <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Course Code</Form.Label>
                                <Form.Control type="text" name="code" value={formData.code} onChange={handleChange} required />
                            </Form.Group>
                             <Form.Group className="mb-3">
                                <Form.Label>Assign Teacher</Form.Label>
                                <Form.Select name="teacherId" value={formData.teacherId} onChange={handleChange} required>
                                    <option value="">Select Teacher</option>
                                    {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                                </Form.Select>
                            </Form.Group>
                            <Button variant="primary" type="submit" className="w-100">Create Course</Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>
            
            <Col lg={8}>
                <Card className="shadow-sm">
                    <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                        <span className="h5 mb-0">Course List</span>
                        <Badge bg="secondary">{courses.length} Courses</Badge>
                    </Card.Header>
                    <Card.Body className="p-0">
                        {loading ? (
                            <div className="text-center p-5"><Spinner animation="border" /></div>
                        ) : (
                            <div className="table-responsive" style={{ maxHeight: '600px' }}>
                                <Table hover striped className="mb-0">
                                    <thead className="table-light sticky-top">
                                        <tr>
                                            <th>Code</th>
                                            <th>Name</th>
                                            <th>Teacher</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {courses.length === 0 ? (
                                            <tr><td colSpan={4} className="text-center p-4 text-muted">No courses found.</td></tr>
                                        ) : (
                                            courses.map(course => (
                                                <tr key={course.id}>
                                                    <td><Badge bg="secondary">{course.code}</Badge></td>
                                                    <td>{course.name}</td>
                                                    <td>{course.teacherName}</td>
                                                    <td>
                                                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(course.id)}>Delete</Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

interface Student {
    id: string;
    fullName: string;
    email: string;
    studentId?: string;
    faculty?: string;
    degreeProgram?: string;
}

const StudentManager = () => {
    const faculties = ["Science", "FCMS", "Arts", "FCT"];
    const scienceDegreePrograms = [
        "ECSC", "PE", "MIT", "Applied Chemistry",
        "PS", "BS", "ENCM", "SS", "SE",
    ];

    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', content: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [filterFaculty, setFilterFaculty] = useState('');
    const [filterDegree, setFilterDegree] = useState('');
    
    // Create Form State
    const [formData, setFormData] = useState({
        studentId: '',
        fullName: '',
        email: '',
        password: '',
        faculty: 'Science',
        degreeProgram: ''
    });

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/admin/all');
            const studentUsers = res.data.filter((u: any) => u.role === 'ROLE_STUDENT');
            setStudents(studentUsers);
        } catch (err) {
            console.error(err);
            setMsg({ type: 'danger', content: 'Failed to fetch students' });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim() && !filterFaculty && !filterDegree) {
            fetchStudents();
            return;
        }
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('query', searchQuery);
            if (filterFaculty) params.append('faculty', filterFaculty);
            if (filterDegree) params.append('degree', filterDegree);

            const res = await api.get(`/api/admin/students/search?${params.toString()}`);
            setStudents(res.data);
        } catch (err) {
            console.error(err);
            setMsg({ type: 'danger', content: 'Failed to search students' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterFaculty, filterDegree]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg({ type: '', content: '' });
        try {
            await api.post('/api/admin/students', formData);
            setMsg({ type: 'success', content: 'Student created successfully' });
            setFormData({
                studentId: '',
                fullName: '',
                email: '',
                password: '',
                faculty: 'Science',
                degreeProgram: ''
            });
            fetchStudents();
        } catch (err: any) {
            console.error(err);
            setMsg({ type: 'danger', content: err.response?.data?.message || 'Failed to create student' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this student?")) return;
        try {
            await api.delete(`/api/admin/${id}`);
            setStudents(prev => prev.filter(s => s.id !== id));
            setMsg({ type: 'success', content: 'Student deleted successfully' });
        } catch (err) {
            console.error(err);
            setMsg({ type: 'danger', content: 'Failed to delete student' });
        }
    };

    return (
        <Row>
            <Col lg={4} className="mb-4">
                 <Card className="shadow-sm">
                    <Card.Header className="bg-primary text-white">Create New Student</Card.Header>
                    <Card.Body>
                        {msg.content && <Alert variant={msg.type} dismissible onClose={() => setMsg({ type: '', content: '' })}>{msg.content}</Alert>}
                        <Form onSubmit={handleCreateStudent}>
                            <Form.Group className="mb-2">
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Student ID (e.g. SE/2021/001)</Form.Label>
                                <Form.Control type="text" name="studentId" value={formData.studentId} onChange={handleChange} required placeholder="XX/YYYY/NUM" />
                            </Form.Group>
                             <Form.Group className="mb-2">
                                <Form.Label>Email</Form.Label>
                                <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
                            </Form.Group>
                             <Form.Group className="mb-2">
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required />
                            </Form.Group>
                            <Row>
                                <Col md={12}>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Faculty</Form.Label>
                                        <Form.Select name="faculty" value={formData.faculty} onChange={e => handleChange(e as any)}>
                                            {faculties.map(f => <option key={f} value={f}>{f}</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-3">
                                <Form.Label>Degree Program</Form.Label>
                                <Form.Select 
                                    name="degreeProgram" 
                                    value={formData.degreeProgram} 
                                    onChange={e => handleChange(e as any)}
                                    disabled={formData.faculty !== "Science"}
                                >
                                    <option value="">Select Degree Program</option>
                                    {scienceDegreePrograms.map(d => <option key={d} value={d}>{d}</option>)}
                                </Form.Select>
                                {formData.faculty !== "Science" && <Form.Text className="text-muted">Only available for Science faculty currently.</Form.Text>}
                            </Form.Group>
                            <Button variant="primary" type="submit" className="w-100">Create Student</Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>
            
            <Col lg={8}>
                <Card className="shadow-sm">
                    <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                        <span className="h5 mb-0">Student List</span>
                        <div className="d-flex align-items-center">
                            <Form.Select 
                                value={filterFaculty} 
                                onChange={(e) => {
                                    setFilterFaculty(e.target.value);
                                    setFilterDegree('');
                                }} 
                                className="me-2" 
                                style={{ maxWidth: '150px' }}
                            >
                                <option value="">All Faculties</option>
                                {faculties.map(f => <option key={f} value={f}>{f}</option>)}
                            </Form.Select>
                            
                            <Form.Select 
                                value={filterDegree} 
                                onChange={(e) => setFilterDegree(e.target.value)} 
                                className="me-2"
                                style={{ maxWidth: '180px' }}
                                disabled={filterFaculty !== "Science" && filterFaculty !== ""}
                            >
                                <option value="">All Degrees</option>
                                {scienceDegreePrograms.map(d => <option key={d} value={d}>{d}</option>)}
                            </Form.Select>

                            <InputGroup className="me-3" style={{ maxWidth: '300px' }}>
                                <Form.Control
                                    placeholder="Search Name / ID"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <Button variant="outline-primary" onClick={handleSearch}>Search</Button>
                            </InputGroup>
                            <Badge bg="secondary">{students.length} Students</Badge>
                        </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                        {loading ? (
                            <div className="text-center p-5"><Spinner animation="border" /></div>
                        ) : (
                            <div className="table-responsive" style={{ maxHeight: '600px' }}>
                                <Table hover striped className="mb-0">
                                    <thead className="table-light sticky-top">
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Faculty/Degree</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.length === 0 ? (
                                            <tr><td colSpan={5} className="text-center p-4 text-muted">No students found.</td></tr>
                                        ) : (
                                            students.map(student => (
                                                <tr key={student.id}>
                                                    <td><Badge bg="info">{student.studentId || 'N/A'}</Badge></td>
                                                    <td>{student.fullName}</td>
                                                    <td>{student.email}</td>
                                                    <td>
                                                        <small>{student.faculty}</small><br/>
                                                        <small className="text-muted">{student.degreeProgram}</small>
                                                    </td>
                                                    <td>
                                                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(student.id)}>Delete</Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

const TimezoneSettings = () => {
    const [timezone, setTimezone] = useState('');
    const [msg, setMsg] = useState('');
    
    const timezones = [
        "Asia/Colombo",
        "UTC",
        "Asia/Kolkata",
        "America/New_York",
        "Europe/London",
        "Australia/Sydney"
    ];

    useEffect(() => {
        api.get('/api/system/timezone').then(res => setTimezone(res.data.timezone)).catch(console.error);
    }, []);

    const handleSave = async () => {
        try {
            await api.post('/api/system/timezone', { timezone });
            setMsg('Timezone updated successfully');
            setTimeout(() => setMsg(''), 3000);
        } catch (e) {
            console.error(e);
            setMsg('Failed to update');
        }
    };

    return (
        <div>
            {msg && <Alert variant="info">{msg}</Alert>}
            <Form.Group className="mb-3">
                <Form.Label>System Timezone</Form.Label>
                <Form.Select value={timezone} onChange={(e: any) => setTimezone(e.target.value)}>
                    {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </Form.Select>
            </Form.Group>
            <Button variant="warning" onClick={handleSave}>Update Timezone</Button>
        </div>
    );
};

export default AdminDashboard;
