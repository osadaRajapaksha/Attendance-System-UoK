import './App.css'
import { useState } from 'react'
// Import the named `Login` component and the tracker to show after login
import { Login } from "./components/student/login";
import GMaps from "./components/teacher/gmaps";

function App() {
  // Initialize logged-in state from presence of a stored token
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => Boolean(localStorage.getItem('token')));

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div>
      <div className="p-3 d-flex justify-content-end">
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => {
            // Clear auth-related localStorage keys on logout
            ['token', 'role', 'email', 'username', 'studentId', 'teacherId'].forEach((k) => localStorage.removeItem(k));
            setIsLoggedIn(false);
          }}
        >
          Logout
        </button>
      </div>
      <GMaps />
    </div>
  );
}

export default App;
