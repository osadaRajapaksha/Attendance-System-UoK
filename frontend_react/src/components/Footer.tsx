import React from 'react';
import { Container } from 'react-bootstrap';

const Footer: React.FC = () => {
  return (
    <footer className="bg-light text-center text-lg-start mt-auto border-top" style={{ padding: '15px 0', zIndex: 1000 }}>
      <Container className="p-2">
        <div className="text-center p-1" style={{ fontSize: '0.9rem', color: '#6c757d' }}>
          © {new Date().getFullYear()} Attendance System UoK. All Rights Reserved.
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
