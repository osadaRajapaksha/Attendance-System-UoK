import React from 'react';
import { Container } from 'react-bootstrap';

const Footer: React.FC = () => {
  return (
    <footer className="bg-light text-center text-lg-start mt-auto" style={{ position: 'fixed', bottom: 0, width: '100%', padding: '10px 0', zIndex: 1000 }}>
      <Container className="p-2">
        <div className="text-center p-1" style={{ fontSize: '0.9rem', color: '#6c757d' }}>
          © {new Date().getFullYear()} Attendance System UoK. All Rights Reserved.
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
