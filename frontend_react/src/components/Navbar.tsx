import React, { useContext } from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const NavBar: React.FC = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    auth?.logout();
    navigate('/login');
  };

  return (
    <Navbar expand="lg" className="mb-4 navbar-glass sticky-top">
      <Container>
        <Navbar.Brand as={Link} to="/">Attendance System</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {auth?.user?.role === 'ROLE_STUDENT' && <Nav.Link as={Link} to="/student-dashboard">Dashboard</Nav.Link>}
            {auth?.user?.role === 'ROLE_TEACHER' && <Nav.Link as={Link} to="/teacher-dashboard">Dashboard</Nav.Link>}
            {auth?.user?.role === 'ROLE_ADMIN' && <Nav.Link as={Link} to="/admin-dashboard">Dashboard</Nav.Link>}
          </Nav>
          <Nav>
            {auth?.isAuthenticated ? (
               <div className="d-flex align-items-center gap-3">
                  <span className="text-muted">Hello, {auth.user?.fullName}</span>
                  <Button variant="outline-danger" onClick={handleLogout}>Logout</Button>
               </div>
            ) : (
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
