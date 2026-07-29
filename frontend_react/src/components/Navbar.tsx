import React, { useContext } from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useAuthContext } from "@asgardeo/auth-react";
import uokLogo from '../assets/Attendance_system_uok.png';

const NavBar: React.FC = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const { signOut } = useAuthContext();

  const handleLogout = async () => {
    auth?.logout();
    await signOut();
    navigate('/login');
  };

  return (
    <Navbar expand="lg" className="mb-4 navbar-glass sticky-top">
      <Container fluid>
        <Navbar.Brand as={Link} to="/">
          <img
            src={uokLogo}
            alt="Attendance System"
            style={{ height: '55px', width: 'auto' }}
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {auth?.user?.role === 'ROLE_STUDENT' && <Nav.Link as={Link} to="/student-dashboard"></Nav.Link>}
            {auth?.user?.role === 'ROLE_TEACHER' && <Nav.Link as={Link} to="/teacher-dashboard"></Nav.Link>}
            {auth?.user?.role === 'ROLE_ADMIN' && <Nav.Link as={Link} to="/admin-dashboard"></Nav.Link>}
          </Nav>
          <Nav>
            {auth?.isAuthenticated ? (
              <div className="d-flex align-items-center gap-3">
                <span className="text-muted">Hello, {auth.user?.fullName}</span>
                <Button /*variant="outline-danger"*/ onClick={handleLogout}>Logout</Button>
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
