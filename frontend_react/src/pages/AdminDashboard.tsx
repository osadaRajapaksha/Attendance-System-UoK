import React, { useState, useEffect } from 'react';
import { Container, Button, Form, Alert, Card, Tabs, Tab, Table, Badge, Row, Col, Spinner, InputGroup, Pagination, Modal, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
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

interface Teacher {
    id: string;
    teacherId: string;
    fullName: string;
    email: string;
    position: string;
    department: string;
    faculty: string;
    username: string; // Needed for some logic
}

interface Course {
    id: string;
    name: string;
    code: string;
}

const TeacherDetailsModal = ({ show, onHide, teacher, refreshTeachers }: { show: boolean, onHide: () => void, teacher: Teacher | null, refreshTeachers: () => void }) => {
    const [activeTab, setActiveTab] = useState('details');
    const [courses, setCourses] = useState<Course[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [msg, setMsg] = useState({ type: '', content: '' });
    const navigate = useNavigate();

    // Edit State
    const [editData, setEditData] = useState<Partial<Teacher>>({});
    
    // Password State
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        if (teacher && show) {
            setEditData({
                fullName: teacher.fullName,
                email: teacher.email,
                position: teacher.position,
                department: teacher.department,
                faculty: teacher.faculty
            });
            setMsg({ type: '', content: '' });
            setNewPassword('');
            fetchCourses();
        }
    }, [teacher, show]);

    const fetchCourses = async () => {
        if (!teacher) return;
        setLoadingCourses(true);
        try {
            const res = await api.get(`/api/teachers/${teacher.id}/courses`);
            setCourses(res.data);
        } catch (err) {
            console.error("Failed to fetch courses", err);
        } finally {
            setLoadingCourses(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teacher) return;
        try {
            await api.put(`/api/teachers/update/${teacher.id}`, editData);
            setMsg({ type: 'success', content: 'Teacher updated successfully' });
            refreshTeachers();
        } catch (err: any) {
            setMsg({ type: 'danger', content: err.response?.data?.message || 'Update failed' });
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teacher) return;
        try {
            await api.post('/api/admin/reset-password', { userId: teacher.id, newPassword });
            setMsg({ type: 'success', content: 'Password updated successfully' });
            setNewPassword('');
        } catch (err: any) {
            setMsg({ type: 'danger', content: err.response?.data?.message || 'Update failed' });
        }
    };

    const handleDefaultReset = async () => {
        if (!teacher) return;
        if (!window.confirm(`Are you sure you want to reset password to default? Default is the Teacher ID: ${teacher.teacherId}`)) return;
        try {
            // Default password is the teacher ID
            await api.post('/api/admin/reset-password', { userId: teacher.id, newPassword: teacher.teacherId });
            setMsg({ type: 'success', content: `Password reset to default: ${teacher.teacherId}` });
        } catch (err: any) {
             setMsg({ type: 'danger', content: err.response?.data?.message || 'Reset failed' });
        }
    };

    if (!teacher) return null;

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Teacher Details: {teacher.fullName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {msg.content && <Alert variant={msg.type} dismissible onClose={() => setMsg({ type: '', content: '' })}>{msg.content}</Alert>}
                <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'details')} className="mb-3">
                    <Tab eventKey="details" title="Details">
                        <Form onSubmit={handleUpdate}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Full Name</Form.Label>
                                        <Form.Control type="text" value={editData.fullName || ''} onChange={e => setEditData({...editData, fullName: e.target.value})} required />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control type="email" value={editData.email || ''} onChange={e => setEditData({...editData, email: e.target.value})} required />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Position</Form.Label>
                                        <Form.Control type="text" value={editData.position || ''} onChange={e => setEditData({...editData, position: e.target.value})} />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Department</Form.Label>
                                        <Form.Control type="text" value={editData.department || ''} onChange={e => setEditData({...editData, department: e.target.value})} />
                                    </Form.Group>
                                </Col>
                            </Row>
                             <Form.Group className="mb-3">
                                <Form.Label>Faculty</Form.Label>
                                <Form.Control type="text" value={editData.faculty || ''} onChange={e => setEditData({...editData, faculty: e.target.value})} />
                            </Form.Group>
                            <Button variant="primary" type="submit">Update Details</Button>
                        </Form>
                    </Tab>
                    <Tab eventKey="password" title="Security">
                        <Form onSubmit={handleUpdatePassword}>
                            <Form.Group className="mb-3">
                                <Form.Label>New Password</Form.Label>
                                <Form.Control type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
                            </Form.Group>
                            <div className="d-flex gap-2">
                                <Button variant="primary" type="submit">Update Password</Button>
                                <Button variant="warning" type="button" onClick={handleDefaultReset}>Reset to Default (Teacher ID)</Button>
                            </div>
                        </Form>
                    </Tab>
                    <Tab eventKey="courses" title="Courses">
                        {loadingCourses ? <Spinner animation="border" size="sm" /> : (
                            courses.length === 0 ? <p className="text-muted">No courses found.</p> : (
                                <ListGroup>
                                    {courses.map(course => (
                                        <ListGroup.Item key={course.id} className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <strong>{course.name}</strong> <small className="text-muted">({course.code})</small>
                                            </div>
                                            <Button size="sm" variant="outline-primary" onClick={() => {
                                                onHide();
                                                navigate(`/teacher/course/${course.id}`);
                                            }}>View Course</Button>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )
                        )}
                    </Tab>
                </Tabs>
            </Modal.Body>
        </Modal>
    );
};

const TeacherManager = () => {
    const faculties = ["Science", "FCMS", "Arts", "FCT"];
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', content: '' });
    const [searchQuery, setSearchQuery] = useState('');
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 5; // Small size for demonstration

    const [teacherData, setTeacherData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '',
        role: 'ROLE_TEACHER',
        teacherId: '',
        position: '',
        department: '',
        faculty: 'Science'
    });

    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [showModal, setShowModal] = useState(false);

    // Data for Dropdowns
    const facultyDepartments: { [key: string]: string[] } = {
        "Science": [
            "Department of Chemistry",
            "Department of Industrial Management",
            "Department of Mathematics",
            "Department of Microbiology",
            "Department of Physics and Electronics",
            "Department of Plant and Molecular Biology",
            "Department of Statistics & Computer Science"
        ],
        "FCMS": ["Department of Commerce", "Department of Finance", "Department of Marketing"],
        "Arts": ["Department of Economics", "Department of English", "Department of History"],
        "FCT": ["Department of ICT", "Department of Engineering Technology"]
    };

    const positions = [
        "Lecturer",
        "Senior Lecturer",
        "Assistant Professor",
        "Professor",
        "Head of Department",
        "Dean",
        "Instructor",
        "Demonstrator",
        "Visiting Lecturer"
    ];

    const openTeacherDetails = (teacher: Teacher) => {
        setSelectedTeacher(teacher);
        setShowModal(true);
    };

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            // Use paginated endpoint
            const res = await api.get(`/api/teachers/all?page=${currentPage}&size=${pageSize}`);
            setTeachers(res.data.content);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error(err);
            setMsg({ type: 'danger', content: 'Failed to fetch teachers' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, [currentPage]); // Refetch when page changes

    const handleChange = (e: React.ChangeEvent<any>) => {
        const { name, value } = e.target;
        setTeacherData(prev => {
            const newData = { ...prev, [name]: value };
            // Reset department if faculty changes
            if (name === 'faculty') {
                newData.department = '';
            }
            return newData;
        });
    };

    const handleCreateTeacher = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg({ type: '', content: '' });
        try {
            // Ensure username is set
            const payload = { 
                ...teacherData, 
                username: teacherData.email
            };
            
            await api.post('/api/teachers/add', payload);
            setMsg({ type: 'success', content: 'Teacher created successfully' });
            setTeacherData({
                username: '',
                email: '',
                password: '',
                fullName: '',
                role: 'ROLE_TEACHER',
                teacherId: '',
                position: '',
                department: '',
                faculty: 'Science'
            });
            fetchTeachers();
        } catch (err: any) {
            console.error(err);
            setMsg({ type: 'danger', content: err.response?.data?.message || 'Failed to create teacher' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this teacher?")) return;
        try {
            await api.delete(`/api/admin/${id}`);
            // Refresh current page
            fetchTeachers();
            setMsg({ type: 'success', content: 'Teacher deleted successfully' });
        } catch (err) {
            console.error(err);
            setMsg({ type: 'danger', content: 'Failed to delete teacher' });
        }
    };

    const filteredTeachers = teachers.filter(t => 
        t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.teacherId && t.teacherId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.department && t.department.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handlePageChange = (page: number) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <Row>
            <Col md={5}>
                 <Card className="shadow-sm mb-4">
                    <Card.Header className="bg-primary text-white">Create New Teacher</Card.Header>
                    <Card.Body>
                        {msg.content && <Alert variant={msg.type} dismissible onClose={() => setMsg({ type: '', content: '' })}>{msg.content}</Alert>}
                        <Form onSubmit={handleCreateTeacher}>
                            <Form.Group className="mb-2">
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control type="text" name="fullName" value={teacherData.fullName} onChange={handleChange} required />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Teacher ID</Form.Label>
                                <Form.Control type="text" name="teacherId" value={teacherData.teacherId} onChange={handleChange} required placeholder="e.g. SC/T/2023/001" />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Email</Form.Label>
                                <Form.Control type="email" name="email" value={teacherData.email} onChange={handleChange} required />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" name="password" value={teacherData.password} onChange={handleChange} required />
                            </Form.Group>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Faculty</Form.Label>
                                        <Form.Select name="faculty" value={teacherData.faculty} onChange={handleChange}>
                                            {faculties.map(f => <option key={f} value={f}>{f}</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Department</Form.Label>
                                        <Form.Select 
                                            name="department" 
                                            value={teacherData.department} 
                                            onChange={handleChange} 
                                            required
                                            disabled={!teacherData.faculty}
                                        >
                                            <option value="">Select Department</option>
                                            {teacherData.faculty && facultyDepartments[teacherData.faculty]?.map(dept => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                             <Form.Group className="mb-3">
                                <Form.Label>Position</Form.Label>
                                <Form.Select 
                                    name="position" 
                                    value={teacherData.position} 
                                    onChange={handleChange} 
                                    required
                                >
                                    <option value="">Select Position</option>
                                    {positions.map(p => <option key={p} value={p}>{p}</option>)}
                                </Form.Select>
                            </Form.Group>
                            
                            <Button variant="primary" type="submit" className="w-100">Create Teacher</Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={7}>
                <Card className="shadow-sm">
                    <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                        <span className="h5 mb-0">Teacher List</span>
                         <InputGroup style={{ maxWidth: '250px' }} size="sm">
                            <Form.Control
                                placeholder="Search Name/ID/Dept"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </InputGroup>
                    </Card.Header>
                    <Card.Body className="p-0">
                         {loading ? (
                            <div className="text-center p-5"><Spinner animation="border" /></div>
                        ) : (
                            <>
                                <div className="table-responsive" style={{ maxHeight: '600px' }}>
                                    <Table hover striped className="mb-0">
                                        <thead className="table-light sticky-top">
                                            <tr>
                                                <th>ID</th>
                                                <th>Name/Position</th>
                                                <th>Dept/Faculty</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredTeachers.length === 0 ? (
                                                <tr><td colSpan={4} className="text-center p-4 text-muted">No teachers found.</td></tr>
                                            ) : (
                                                filteredTeachers.map(teacher => (
                                                    <tr key={teacher.id}>
                                                        <td><Badge bg="warning" text="dark">{teacher.teacherId || 'N/A'}</Badge></td>
                                                        <td>
                                                            <div 
                                                                style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }} 
                                                                onClick={() => openTeacherDetails(teacher)}
                                                            >
                                                                {teacher.fullName}
                                                            </div>
                                                            <small className="text-muted">{teacher.position}</small>
                                                        </td>
                                                        <td>
                                                            <div>{teacher.department}</div>
                                                            <small className="text-muted">{teacher.faculty}</small>
                                                        </td>
                                                        <td>
                                                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(teacher.id)}>Delete</Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                                <div className="d-flex justify-content-center p-3">
                                    <Pagination>
                                        <Pagination.First onClick={() => handlePageChange(0)} disabled={currentPage === 0} />
                                        <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0} />
                                        
                                        {[...Array(totalPages)].map((_, idx) => (
                                            <Pagination.Item key={idx} active={idx === currentPage} onClick={() => handlePageChange(idx)}>
                                                {idx + 1}
                                            </Pagination.Item>
                                        ))}
                                        
                                        <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1} />
                                        <Pagination.Last onClick={() => handlePageChange(totalPages - 1)} disabled={currentPage === totalPages - 1} />
                                    </Pagination>
                                </div>
                            </>
                        )}
                    </Card.Body>
                </Card>
            </Col>
            
            <TeacherDetailsModal 
                show={showModal} 
                onHide={() => setShowModal(false)} 
                teacher={selectedTeacher} 
                refreshTeachers={fetchTeachers} 
            />
        </Row>
    );
};

const faculties = ["Science", "FCMS", "Arts", "FCT"];
const scienceDegreePrograms = [
    "ECSC", "PE", "MIT", "Applied Chemistry",
    "PS", "BS", "ENCM", "SS", "SE",
];

const StudentDetailsModal = ({ show, onHide, student, refreshStudents }: { show: boolean, onHide: () => void, student: Student | null, refreshStudents: () => void }) => {
    const [activeTab, setActiveTab] = useState('details');
    const [courses, setCourses] = useState<Course[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [msg, setMsg] = useState({ type: '', content: '' });
    const navigate = useNavigate();

    // Edit State
    const [editData, setEditData] = useState<Partial<Student>>({});
    
    // Password State
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        if (student && show) {
            setEditData({
                fullName: student.fullName,
                email: student.email,
                studentId: student.studentId,
                faculty: student.faculty,
                degreeProgram: student.degreeProgram
            });
            setMsg({ type: '', content: '' });
            setNewPassword('');
            fetchCourses();
        }
    }, [student, show]);

    const fetchCourses = async () => {
        if (!student) return;
        setLoadingCourses(true);
        try {
            const res = await api.get(`/api/students/${student.id}/courses`);
            setCourses(res.data);
        } catch (err) {
            console.error("Failed to fetch courses", err);
        } finally {
            setLoadingCourses(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!student) return;
        try {
            await api.put(`/api/students/update/${student.id}`, editData);
            setMsg({ type: 'success', content: 'Student updated successfully' });
            refreshStudents();
        } catch (err: any) {
            setMsg({ type: 'danger', content: err.response?.data?.message || 'Update failed' });
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!student) return;
        try {
            await api.post('/api/admin/reset-password', { userId: student.id, newPassword });
            setMsg({ type: 'success', content: 'Password updated successfully' });
            setNewPassword('');
        } catch (err: any) {
            setMsg({ type: 'danger', content: err.response?.data?.message || 'Update failed' });
        }
    };

    const handleDefaultReset = async () => {
        if (!student) return;
        if (!window.confirm(`Are you sure you want to reset password to default? Default is the Student ID: ${student.studentId}`)) return;
        try {
            // Default password is the student ID
            await api.post('/api/admin/reset-password', { userId: student.id, newPassword: student.studentId });
            setMsg({ type: 'success', content: `Password reset to default: ${student.studentId}` });
        } catch (err: any) {
             setMsg({ type: 'danger', content: err.response?.data?.message || 'Reset failed' });
        }
    };

    if (!student) return null;

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Student Details: {student.fullName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {msg.content && <Alert variant={msg.type} dismissible onClose={() => setMsg({ type: '', content: '' })}>{msg.content}</Alert>}
                <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'details')} className="mb-3">
                    <Tab eventKey="details" title="Details">
                        <Form onSubmit={handleUpdate}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Full Name</Form.Label>
                                        <Form.Control type="text" value={editData.fullName || ''} onChange={e => setEditData({...editData, fullName: e.target.value})} required />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control type="email" value={editData.email || ''} onChange={e => setEditData({...editData, email: e.target.value})} required />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Student ID</Form.Label>
                                        <Form.Control type="text" value={editData.studentId || ''} onChange={e => setEditData({...editData, studentId: e.target.value})} />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Faculty</Form.Label>
                                        <Form.Select 
                                            value={editData.faculty || ''} 
                                            onChange={e => {
                                                const newFaculty = e.target.value;
                                                setEditData(prev => ({
                                                    ...prev, 
                                                    faculty: newFaculty,
                                                    degreeProgram: '' // Reset degree if faculty changes
                                                }));
                                            }}
                                        >
                                            {faculties.map(f => <option key={f} value={f}>{f}</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                             <Form.Group className="mb-3">
                                <Form.Label>Degree Program</Form.Label>
                                <Form.Select 
                                    value={editData.degreeProgram || ''} 
                                    onChange={e => setEditData(prev => ({...prev, degreeProgram: e.target.value}))}
                                    disabled={editData.faculty !== "Science"}
                                >
                                    <option value="">Select Degree Program</option>
                                    {scienceDegreePrograms.map(d => <option key={d} value={d}>{d}</option>)}
                                </Form.Select>
                                {editData.faculty !== "Science" && <Form.Text className="text-muted">Only available for Science faculty currently.</Form.Text>}
                            </Form.Group>
                            <Button variant="primary" type="submit">Update Details</Button>
                        </Form>
                    </Tab>
                    <Tab eventKey="password" title="Security">
                        <Form onSubmit={handleUpdatePassword}>
                            <Form.Group className="mb-3">
                                <Form.Label>New Password</Form.Label>
                                <Form.Control type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
                            </Form.Group>
                            <div className="d-flex gap-2">
                                <Button variant="primary" type="submit">Update Password</Button>
                                <Button variant="warning" type="button" onClick={handleDefaultReset}>Reset to Default (Student ID)</Button>
                            </div>
                        </Form>
                    </Tab>
                    <Tab eventKey="courses" title="Enrolled Courses">
                        {loadingCourses ? <Spinner animation="border" size="sm" /> : (
                            courses.length === 0 ? <p className="text-muted">No enrolled courses found.</p> : (
                                <ListGroup>
                                    {courses.map(course => (
                                        <ListGroup.Item key={course.id} className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <strong>{course.name}</strong> <small className="text-muted">({course.code})</small>
                                            </div>
                                            <Button size="sm" variant="outline-primary" onClick={() => {
                                                onHide();
                                                navigate(`/teacher/course/${course.id}`);
                                            }}>View Course</Button>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )
                        )}
                    </Tab>
                </Tabs>
            </Modal.Body>
        </Modal>
    );
};

interface Course {
    id: string;
    name: string;
    code: string;
    teacherName?: string;
    teacherId?: string;
    enrollmentKey?: string;
    description?: string;
}

const CourseDetailsModal = ({ show, onHide, course, refreshCourses }: { show: boolean, onHide: () => void, course: Course | null, refreshCourses: () => void }) => {
    const [activeTab, setActiveTab] = useState('details');
    const [msg, setMsg] = useState({ type: '', content: '' });
    const [editData, setEditData] = useState<Partial<Course>>({});
    const [loadingDownload, setLoadingDownload] = useState(false);
    const [sessions, setSessions] = useState<any[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(false);

    useEffect(() => {
        if (course && show) {
            setEditData({
                name: course.name,
                code: course.code,
                enrollmentKey: course.enrollmentKey,
            });
            setMsg({ type: '', content: '' });
            fetchSessions();
        }
    }, [course, show]);

    const fetchSessions = async () => {
        if (!course) return;
        setLoadingSessions(true);
        try {
            const res = await api.get(`/api/sessions/course/${course.id}`);
            setSessions(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingSessions(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!course) return;
        try {
            await api.put(`/api/courses/update/${course.id}`, editData);
            setMsg({ type: 'success', content: 'Course updated successfully' });
            refreshCourses();
        } catch (err: any) {
            setMsg({ type: 'danger', content: err.response?.data?.message || 'Update failed' });
        }
    };

    const handleDownloadReport = async (type: 'attendance' | 'students') => {
        if (!course) return;
        setLoadingDownload(true);
        try {
            const endpoint = type === 'attendance' ? 'export/attendance' : 'export/students';
            const filename = type === 'attendance' ? `${course.code}_attendance_matrix.xlsx` : `${course.code}_enrolled_students.xlsx`;
            
            const response = await api.get(`/api/courses/${course.id}/${endpoint}`, {
                responseType: 'blob',
            });
            
            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            setMsg({ type: 'success', content: `Report (${type}) downloaded successfully` });
        } catch (err: any) {
            console.error(err);
            setMsg({ type: 'danger', content: 'Failed to download report' });
        } finally {
            setLoadingDownload(false);
        }
    };

    // Session Management Handlers
    const handleDeleteSession = async (sessionId: string) => {
        if(!window.confirm("Are you sure?")) return;
        try {
            await api.delete(`/api/sessions/${sessionId}`);
            fetchSessions();
        } catch(err) {
            alert("Failed to delete session");
        }
    }

    if (!course) return null;

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Course Details: {course.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {msg.content && <Alert variant={msg.type} dismissible onClose={() => setMsg({ type: '', content: '' })}>{msg.content}</Alert>}
                <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'details')} className="mb-3">
                    <Tab eventKey="details" title="Details">
                        <Form onSubmit={handleUpdate}>
                            <Form.Group className="mb-2">
                                <Form.Label>Course Name</Form.Label>
                                <Form.Control type="text" value={editData.name || ''} onChange={e => setEditData({...editData, name: e.target.value})} required />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Course Code</Form.Label>
                                <Form.Control type="text" value={editData.code || ''} onChange={e => setEditData({...editData, code: e.target.value})} required />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Enrollment Key</Form.Label>
                                <Form.Control type="text" value={editData.enrollmentKey || ''} onChange={e => setEditData({...editData, enrollmentKey: e.target.value})} />
                            </Form.Group>
                             <div className="d-flex justify-content-end">
                                <Button variant="primary" type="submit">Update Course</Button>
                            </div>
                        </Form>
                    </Tab>
                    <Tab eventKey="sessions" title={`Sessions (${sessions.length})`}>
                       {loadingSessions ? <Spinner animation="border"/> : (
                           <div className="table-responsive" style={{maxHeight: '400px'}}>
                               <Table striped size="sm">
                                   <thead><tr><th>Date</th><th>Title</th><th>Status</th><th>Action</th></tr></thead>
                                   <tbody>
                                       {sessions.map(s => (
                                           <tr key={s.id}>
                                               <td>{new Date(s.startTime).toLocaleDateString()}</td>
                                               <td>{s.title}</td>
                                               <td><Badge bg={s.status === 'ACTIVE' ? 'success' : s.status === 'SCHEDULED' ? 'primary' : 'secondary'}>{s.status}</Badge></td>
                                               <td>
                                                   <Button size="sm" variant="danger" onClick={() => handleDeleteSession(s.id)}>Delete</Button>
                                               </td>
                                           </tr>
                                       ))}
                                   </tbody>
                               </Table>
                               <div className="text-muted small mt-2">
                                   * To create or edit sessions in detail, please instruct the assigned teacher or use the specific session management tools.
                               </div>
                           </div>
                       )}
                    </Tab>
                    <Tab eventKey="reports" title="Reports">
                        <div className="d-grid gap-3 p-3">
                            <Card className="text-center p-3">
                                <h6>Attendance Matrix</h6>
                                <p className="text-muted small">Session-wise attendance for all students.</p>
                                <Button variant="success" onClick={() => handleDownloadReport('attendance')} disabled={loadingDownload}>
                                    {loadingDownload ? <Spinner animation="border" size="sm" /> : 'Download Attendance Matrix'}
                                </Button>
                            </Card>
                            
                            <Card className="text-center p-3">
                                <h6>Enrolled Students</h6>
                                <p className="text-muted small">List of all currently enrolled students.</p>
                                <Button variant="info" className="text-white" onClick={() => handleDownloadReport('students')} disabled={loadingDownload}>
                                    {loadingDownload ? <Spinner animation="border" size="sm" /> : 'Download Student List'}
                                </Button>
                            </Card>
                        </div>
                    </Tab>
                </Tabs>
            </Modal.Body>
        </Modal>
    );
};

const CourseManager = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]); // simplified for now
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', content: '' });
    
    // Create Form State
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        teacherId: '',
        enrollmentKey: ''
    });

    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [showModal, setShowModal] = useState(false);

    const openCourseDetails = (course: Course) => {
        setSelectedCourse(course);
        setShowModal(true);
    };

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
                code: formData.code,
                enrollmentKey: formData.enrollmentKey
            });
            setMsg({ type: 'success', content: 'Course created successfully' });
            setFormData({ name: '', code: '', teacherId: '', enrollmentKey: '' });
            fetchData();
        } catch (err: any) {
            console.error(err);
            setMsg({ type: 'danger', content: err.response?.data?.message || 'Failed to create course' });
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row click
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
                            <Form.Group className="mb-2">
                                <Form.Label>Enrollment Key (Optional)</Form.Label>
                                <Form.Control type="text" name="enrollmentKey" value={formData.enrollmentKey} onChange={handleChange} placeholder="Leave empty if none" />
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
                                                <tr key={course.id} onClick={() => openCourseDetails(course)} style={{ cursor: 'pointer' }}>
                                                    <td><Badge bg="secondary">{course.code}</Badge></td>
                                                    <td>{course.name}</td>
                                                    <td>{course.teacherName}</td>
                                                    <td>
                                                        <Button variant="outline-danger" size="sm" onClick={(e) => handleDelete(course.id, e)}>Delete</Button>
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

            <CourseDetailsModal 
                show={showModal} 
                onHide={() => setShowModal(false)} 
                course={selectedCourse} 
                refreshCourses={fetchData} 
            />
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
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 5;

    // Create Form State
    const [formData, setFormData] = useState({
        studentId: '',
        fullName: '',
        email: '',
        password: '',
        faculty: 'Science',
        degreeProgram: ''
    });

    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [showModal, setShowModal] = useState(false);

    const openStudentDetails = (student: Student) => {
        setSelectedStudent(student);
        setShowModal(true);
    };

    const fetchStudents = async () => {
        setLoading(true);
        try {
            // Use new paginated endpoint
            const res = await api.get(`/api/students/all?page=${currentPage}&size=${pageSize}`);
            setStudents(res.data.content);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error(err);
            setMsg({ type: 'danger', content: 'Failed to fetch students' });
        } finally {
            setLoading(false);
        }
    };

    // Client-side search for now (or could implement server-side search endpoint later)
    // The previous implementation had a search endpoint, let's keep it but simpler for now
    // Actually, asking backend for search is better if we have it, but for now user asked for pagination on main list.
    // If search is used, we might need to handle pagination differently or disable it.
    // Let's stick to the paginated fetch for the main view.
    // If search query is present, we should probably call the search endpoint (which returns a list, not page).
    
    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchStudents();
            return;
        }
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('query', searchQuery);
            // We can add faculty/degree filters later if needed, keeping it simple for now as requested
            
            const res = await api.get(`/api/admin/students/search?${params.toString()}`);
            setStudents(res.data);
            setTotalPages(1); // Search results are usually not paginated in this simple implementation
        } catch (err) {
            console.error(err);
            setMsg({ type: 'danger', content: 'Failed to search students' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!searchQuery) {
            fetchStudents();
        }
    }, [currentPage, searchQuery]); // Refetch when page changes

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg({ type: '', content: '' });
        try {
            // Remove department from payload implicitly by not sending it or backend ignoring it
            // formData doesn't have department anymore
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

    const handlePageChange = (page: number) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page);
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
                            <InputGroup className="me-3" style={{ maxWidth: '300px' }}>
                                <Form.Control
                                    placeholder="Search Name / ID"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <Button variant="outline-primary" onClick={handleSearch}>Search</Button>
                            </InputGroup>
                        </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                        {loading ? (
                            <div className="text-center p-5"><Spinner animation="border" /></div>
                        ) : (
                            <>
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
                                                        <td>
                                                            <div 
                                                                style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }} 
                                                                onClick={() => openStudentDetails(student)}
                                                            >
                                                                {student.fullName}
                                                            </div>
                                                        </td>
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
                                <div className="d-flex justify-content-center p-3">
                                    <Pagination>
                                        <Pagination.First onClick={() => handlePageChange(0)} disabled={currentPage === 0} />
                                        <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0} />
                                        
                                        {[...Array(totalPages)].map((_, idx) => (
                                            <Pagination.Item key={idx} active={idx === currentPage} onClick={() => handlePageChange(idx)}>
                                                {idx + 1}
                                            </Pagination.Item>
                                        ))}
                                        
                                        <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1} />
                                        <Pagination.Last onClick={() => handlePageChange(totalPages - 1)} disabled={currentPage === totalPages - 1} />
                                    </Pagination>
                                </div>
                            </>
                        )}
                    </Card.Body>
                </Card>
            </Col>

            <StudentDetailsModal 
                show={showModal} 
                onHide={() => setShowModal(false)} 
                student={selectedStudent} 
                refreshStudents={fetchStudents} 
            />
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
