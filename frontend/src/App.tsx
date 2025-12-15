import './App.css'
import { useState } from 'react'
// Import the named `Login` component and the tracker to show after login
import Login from "./components/student/login";
import GMaps from "./components/teacher/gmaps";
import CourseList from "./components/student/course";

function App() {
  // logged-in state is implied by `view` and stored token (no separate state required)

  // Track which main view to show: login / courses / gmaps
  const [view, setView] = useState<'login'|'courses'|'gmaps'>(() => {
    if (!localStorage.getItem('token')) return 'login';
    const r = (localStorage.getItem('role') ?? '').toUpperCase();
    return r.includes('TEACHER') ? 'gmaps' : 'courses';
  });

  const handleLogin = () => {
    const r = (localStorage.getItem('role') ?? '').toUpperCase();
    setView(r.includes('TEACHER') ? 'gmaps' : 'courses');
  };

  if (view === 'login') {
    return <Login onLogin={handleLogin} />;
  }


  return (
    <div>
      <div className="p-3 d-flex justify-content-end">
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => {
            // Clear auth-related localStorage keys on logout
            ['token', 'role', 'email', 'username', 'studentId', 'teacherId'].forEach((k) => localStorage.removeItem(k));
            setView('login');
          }}
        >
          Logout
        </button>
      </div>
      {view === 'courses' && <CourseList />}
      {view === 'gmaps' && <GMaps />}
    </div>
  );
}

export default App;
