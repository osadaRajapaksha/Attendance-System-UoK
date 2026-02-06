import React, { useState, useCallback, useRef } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { GoogleMap, useJsApiLoader, DrawingManager } from '@react-google-maps/api';
import api from '../api/axios';
import { useNavigate, useParams } from 'react-router-dom';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 7.2906, 
  lng: 80.6337
};

const TeacherSessionCreate: React.FC = () => {
    const { courseId } = useParams<{courseId: string}>();
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [weekly, setWeekly] = useState(false);
    const [recurrenceStartDate, setRecurrenceStartDate] = useState('');
    const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
    const [scheduledDates, setScheduledDates] = useState<string[]>([]);
    const [boundary, setBoundary] = useState<{lat: number, lng: number}[]>([]);

    // Effect to calculate scheduled dates
    React.useEffect(() => {
        if (weekly && startTime && recurrenceStartDate && recurrenceEndDate) {
            const dates: string[] = [];
            let current = new Date(recurrenceStartDate);
            // Ensure first session starts at correct time on the start date
            const startDateTime = new Date(startTime);
            current.setHours(startDateTime.getHours(), startDateTime.getMinutes());

            const end = new Date(recurrenceEndDate);
            end.setHours(23, 59, 59); // Include the end date fully

            while (current <= end) {
                dates.push(current.toISOString());
                current.setDate(current.getDate() + 7); // Add 7 days
            }
            setScheduledDates(dates);
        } else {
            setScheduledDates([]);
        }
    }, [weekly, startTime, recurrenceStartDate, recurrenceEndDate]);

    // Initialize recurrence start date when start time changes
    React.useEffect(() => {
        if (startTime) {
             // For simplicity, default recurrence start is the session start date
             setRecurrenceStartDate(startTime.split('T')[0]);
        }
    }, [startTime]);
    
    // Map Center State
    const [mapCenter, setMapCenter] = useState(defaultCenter);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const navigate = useNavigate();

    // Fetch user location on mount
    React.useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setMapCenter({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (err) => {
                    console.error("Error getting location: ", err);
                    // Fallback to default center if location access denied/fails
                }
            );
        }
    }, []);

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
                recurrenceEndDate: weekly && recurrenceEndDate ? new Date(recurrenceEndDate).toISOString() : null,
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
                  <Form.Check 
                      type="checkbox" 
                      label="Weekly Schedule?" 
                      checked={weekly} 
                      onChange={(e) => setWeekly(e.target.checked)} 
                  />
              </Form.Group>

              {weekly && (
                  <div className="mb-4 ps-3 border-start border-primary">
                      <Form.Group className="mb-3">
                          <Form.Label>Recurrence Start Date</Form.Label>
                          <Form.Control 
                              type="date" 
                              value={recurrenceStartDate} 
                              onChange={(e) => setRecurrenceStartDate(e.target.value)} 
                              min={startTime ? startTime.split('T')[0] : ''}
                              required 
                          />
                          <Form.Text className="text-muted">Sessions will be scheduled weekly starting from this date.</Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3">
                          <Form.Label>Recurrence End Date</Form.Label>
                          <Form.Control 
                              type="date" 
                              value={recurrenceEndDate} 
                              onChange={(e) => setRecurrenceEndDate(e.target.value)} 
                              min={recurrenceStartDate || (startTime ? startTime.split('T')[0] : '')}
                              required 
                          />
                      </Form.Group>

                      {scheduledDates.length > 0 && (
                          <div className="mb-3">
                              <strong>Scheduled Dates Preview ({scheduledDates.length} sessions):</strong>
                              <ul className="mt-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                  {scheduledDates.map((date, idx) => (
                                      <li key={idx}>{new Date(date).toDateString()}</li>
                                  ))}
                              </ul>
                          </div>
                      )}
                  </div>
              )}
              
              <Form.Group className="mb-3">
                  <Form.Label>Draw Session Area (Rectangle)</Form.Label>
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={mapCenter}
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
