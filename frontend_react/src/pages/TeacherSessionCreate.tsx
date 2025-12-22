import React, { useState, useCallback, useRef } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { GoogleMap, useJsApiLoader, DrawingManager } from '@react-google-maps/api';
import api from '../api/axios';
import { useNavigate, useParams } from 'react-router-dom';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 7.2906, 
  lng: 80.6337
};

const TeacherSessionCreate: React.FC = () => {
    const { courseId } = useParams<{courseId: string}>();
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [weekly, setWeekly] = useState(false);
    const [boundary, setBoundary] = useState<{lat: number, lng: number}[]>([]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const navigate = useNavigate();

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "AIzaSyA2eLFexIQfCqji9Tgrb73vKVJh0Fm_RXs",
        libraries: ['drawing', 'geometry']
    });

    const [map, setMap] = React.useState(null);
    const rectRef = useRef<any>(null);

    const onLoad = useCallback(function callback(map: any) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map: any) {
        setMap(null);
    }, []);

    const onRectangleComplete = (rect: any) => {
        const bounds = rect.getBounds();
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        
        // Convert bounds to 4 corners
        const corners = [
            { lat: ne.lat(), lng: ne.lng() }, // NE
            { lat: sw.lat(), lng: ne.lng() }, // SE
            { lat: sw.lat(), lng: sw.lng() }, // SW
            { lat: ne.lat(), lng: sw.lng() }  // NW
        ];
        
        setBoundary(corners);
        
        if (rectRef.current) {
            rectRef.current.setMap(null);
        }
        rectRef.current = rect;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (boundary.length !== 4) {
            setError("Please draw a valid area (Square/Rectangle) on the map.");
            return;
        }

        setLoading(true);
        try {
            await api.post('/api/sessions/create', {
                courseId, 
                title,
                startTime,
                endTime,
                weekly,
                boundary
            });
            setSuccess("Session created successfully!");
            // Redirect back to course details
            setTimeout(() => navigate(`/teacher/course/${courseId}`), 2000);
        } catch (err: any) {
            console.error(err);
            setError("Failed to create session.");
        } finally {
            setLoading(false);
        }
    };

  return isLoaded ? (
      <Container className="mt-4">
          <h2>Create Session</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                  <Form.Label>Session Title</Form.Label>
                  <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </Form.Group>
            
              <Form.Group className="mb-3">
                  <Form.Label>Start Time</Form.Label>
                  <Form.Control type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
              </Form.Group>

              <Form.Group className="mb-3">
                  <Form.Label>End Time</Form.Label>
                  <Form.Control type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
              </Form.Group>

              <Form.Group className="mb-3">
                  <Form.Check type="checkbox" label="Weekly Schedule?" checked={weekly} onChange={(e) => setWeekly(e.target.checked)} />
              </Form.Group>
              
              <Form.Group className="mb-3">
                  <Form.Label>Draw Session Area (Rectangle)</Form.Label>
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={15}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                  >
                     <DrawingManager
                        onRectangleComplete={onRectangleComplete}
                        options={{
                            drawingControl: true,
                            drawingControlOptions: {
                                drawingModes: ['rectangle' as any]
                            },
                            rectangleOptions: {
                                editable: true,
                                draggable: true
                            }
                        }}
                     />
                  </GoogleMap>
                  <Form.Text>Draw a square/rectangle shape around the classroom area.</Form.Text>
              </Form.Group>

              <Button type="submit" disabled={loading}>
                  {loading ? <Spinner size="sm" animation="border"/> : "Create Session"}
              </Button>
          </Form>
      </Container>
  ) : <Container><Spinner animation="border" /></Container>;
}

export default TeacherSessionCreate;
