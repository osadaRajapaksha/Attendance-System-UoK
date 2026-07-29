import React, { useState } from 'react';
import { Button, Container, Spinner, Card } from 'react-bootstrap';
import { useAuthContext } from "@asgardeo/auth-react";
import uokLogo from '../assets/Attendance_system_uok.png';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuthContext();

  const handleLoginClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn();
    // setLoading(false) isn't strictly necessary since we'll redirect away
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

          <div className="mt-4">
            <Button 
              variant="primary" 
              className="w-100 d-flex align-items-center justify-content-center py-2" 
              onClick={handleLoginClick}
              disabled={loading}
            >
              {loading ? <Spinner animation="border" size="sm" /> : (
                <>
                  <img src="https://asgardeo.io/theme/images/favicon.ico" alt="Asgardeo" style={{width: '20px', marginRight: '10px'}} />
                  Continue with Asgardeo
                </>
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;
