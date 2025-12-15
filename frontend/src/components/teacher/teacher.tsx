import React, { useState } from 'react';

interface CourseCreateResult {
  id?: string;
  name?: string;
  code?: string;
  teacherId?: string;
}

export default function TeacherCreate(): React.ReactElement {
  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CourseCreateResult | null>(null);

  const API_BASE = 'http://localhost:8081';

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !code.trim()) {
      setError('Course name and code are required');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not authenticated. Please login as a teacher.');
      return;
    }

    setLoading(true);

    const payload = {
      name: name.trim(),
      code: code.trim(),
      // Note: backend CreateCourseDTO only accepts `name` and `code`.
      // We keep start/end locally for scheduling display only until
      // backend is extended to accept scheduling fields.
      start: startDate && startTime ? `${startDate}T${startTime}` : undefined,
      end: endDate && endTime ? `${endDate}T${endTime}` : undefined,
    } as any;

    try {
      const resp = await fetch(`${API_BASE}/api/courses/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: payload.name, code: payload.code }),
      });

      if (!resp.ok) {
        let msg = `Create failed (${resp.status})`;
        try {
          const body = await resp.json();
          if (body && body.message) msg = String(body.message);
        } catch (_) {}
        setError(msg);
        return;
      }

      const body = await resp.json();
      setCreated({ id: body.id ?? body._id ?? body.code, name: body.name, code: body.code, teacherId: body.teacherId });
      // Clear inputs but keep schedule fields so teacher can reuse them
      setName('');
      setCode('');
    } catch (err: any) {
      setError('Network error: ' + (err?.message ?? String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-3">
      <h3>Create Course</h3>

      {error && <div className="alert alert-danger">{error}</div>}
      {created && (
        <div className="alert alert-success">
          Created course <strong>{created.name}</strong> (ID: {created.id})
        </div>
      )}

      <form onSubmit={handleCreate} className="row g-3">
        <div className="col-12">
          <label htmlFor="courseName" className="form-label">Course Name</label>
          <input id="courseName" className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="col-md-6">
          <label htmlFor="courseCode" className="form-label">Course Code (ID)</label>
          <input id="courseCode" className="form-control" value={code} onChange={(e) => setCode(e.target.value)} />
        </div>

        <div className="col-md-3">
          <label htmlFor="startDate" className="form-label">Start Date</label>
          <input id="startDate" type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="col-md-3">
          <label htmlFor="startTime" className="form-label">Start Time</label>
          <input id="startTime" type="time" className="form-control" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </div>

        <div className="col-md-3">
          <label htmlFor="endDate" className="form-label">End Date</label>
          <input id="endDate" type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div className="col-md-3">
          <label htmlFor="endTime" className="form-label">End Time</label>
          <input id="endTime" type="time" className="form-control" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>

        <div className="col-12 d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating…' : 'Create Course'}</button>
        </div>
      </form>
    </div>
  );
}
