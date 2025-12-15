import { useEffect, useState } from 'react';

// Course type mirrors backend model
interface Course {
  id: string;
  name?: string;
  code?: string;
  teacherId?: string;
  studentIds?: string[];
}

type CourseListProps = {
  // Optional: pass a pre-fetched list of courses
  initialCourses?: Course[];
};

export default function CourseList({ initialCourses }: CourseListProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses ?? []);
  // Local sample courses used for demo when the backend doesn't return any
  const sampleCourses: Course[] = [
    { id: 'CSE101', name: 'Intro to Computer Science', code: 'CSE101', teacherId: 'T1' },
    { id: 'MTH201', name: 'Calculus II', code: 'MTH201', teacherId: 'T2' },
    { id: 'PHY150', name: 'General Physics', code: 'PHY150', teacherId: 'T3' },
  ];
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState<Record<string, boolean>>({});
  const [enrolled, setEnrolled] = useState<Record<string, boolean>>({});
  const [manualId, setManualId] = useState<string>('');

  // Try to fetch user info and (if teacher) their courses from backend
  useEffect(() => {
    if (initialCourses && initialCourses.length > 0) return;

    const API_BASE = 'http://localhost:8081';
    const token = localStorage.getItem('token');

    const load = async () => {
      setLoading(true);
      setError(null);

      if (!token) {
        // No token available; leave sample courses in place
        setLoading(false);
        return;
      }

      try {
        // Fetch current user to determine role
        const meResp = await fetch(`${API_BASE}/api/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!meResp.ok) {
          setError('Could not fetch user info');
          setLoading(false);
          return;
        }

        const me = await meResp.json();
        setUserRole(me?.role?.name ?? String(me?.role ?? '') ?? null);
        setUsername(me?.username ?? me?.email ?? null);

        // If teacher, fetch their courses via backend endpoint
        if (String(me?.role).toUpperCase().includes('TEACHER')) {
          const coursesResp = await fetch(`${API_BASE}/api/courses/teacher`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (coursesResp.ok) {
            const list = await coursesResp.json();
            setCourses(Array.isArray(list) ? list : []);
          }
        }
      } catch (err: any) {
        setError('Could not load courses/user info: ' + (err?.message ?? String(err)));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [initialCourses]);

  const enroll = async (courseId: string) => {
    setError(null);
    setEnrolling((s) => ({ ...s, [courseId]: true }));

    const token = localStorage.getItem('token');
    const API_BASE = 'http://localhost:8081';
    try {
      const resp = await fetch(`${API_BASE}/api/courses/${encodeURIComponent(courseId)}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!resp.ok) {
        let msg = `Enroll failed (${resp.status})`;
        try {
          const body = await resp.json();
          if (body && body.message) msg = body.message;
        } catch (_) {}
        setError(msg);
        return;
      }

      // Success - mark locally as enrolled
      setEnrolled((s) => ({ ...s, [courseId]: true }));
    } catch (err: any) {
      setError('Network error: ' + (err?.message ?? String(err)));
    } finally {
      setEnrolling((s) => ({ ...s, [courseId]: false }));
    }
  };

  const enrollManual = async () => {
    if (!manualId.trim()) return;
    await enroll(manualId.trim());
    setManualId('');
  };

  const displayCourses = courses.length === 0 ? sampleCourses : courses;

  return (
    <div className="container py-3">
      <h3 className="mb-3">Courses</h3>
      {username && (
        <div className="small text-muted mb-2">Signed in as {username}{userRole ? ` (${userRole})` : ''}</div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <label className="form-label">Enroll by Course ID</label>
        <div className="d-flex gap-2">
          <input
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            className="form-control"
            placeholder="Paste course id here"
          />
          <button className="btn btn-primary" onClick={enrollManual}>
            Enroll
          </button>
        </div>
      </div>

      {loading ? (
        <div>Loading courses…</div>
      ) : displayCourses.length === 0 ? (
        <div className="text-muted">No courses available to list.</div>
      ) : (
        <ul className="list-group">
          {displayCourses.map((c) => (
            <li key={c.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-semibold">{c.name ?? c.code ?? c.id}</div>
                <div className="small text-muted">ID: {c.id} {c.code ? '• ' + c.code : ''}</div>
              </div>
              <div>
                {enrolled[c.id] ? (
                  <span className="badge bg-success">Enrolled</span>
                ) : (
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => enroll(c.id)}
                    disabled={!!enrolling[c.id]}
                  >
                    {enrolling[c.id] ? 'Enrolling…' : 'Enroll'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
