
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import NavBar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TeacherSessionCreate from './pages/TeacherSessionCreate';
import TeacherCourseDetails from './pages/TeacherCourseDetails';
import StudentSessions from './pages/StudentSessions';
import StudentCourseDetails from './pages/StudentCourseDetails';
import ForgotPassword from './pages/ForgotPassword';
import ProtectedRoute from './components/ProtectedRoute';


import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

function HomeRedirect() {
  const auth = useContext(AuthContext);

  if (!auth?.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const role = auth.user?.role;
  if (role === 'ROLE_STUDENT') return <Navigate to="/student-dashboard" />;
  if (role === 'ROLE_TEACHER') return <Navigate to="/teacher-dashboard" />;
  if (role === 'ROLE_ADMIN') return <Navigate to="/admin-dashboard" />;

  return <Navigate to="/login" />;
}

import Terms from './pages/Terms';
import Footer from './components/Footer';

// ... (existing code)

function App() {
  const location = useLocation();
  const hideNavBar = ['/login', '/register', '/forgot-password'].includes(location.pathname);

  return (
    <div className={`d-flex flex-column min-vh-100 ${hideNavBar ? 'auth-bg' : ''}`}>
      {!hideNavBar && <NavBar />}
      <div className="flex-grow-1 mb-5 pb-5">
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/terms" element={<Terms />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_STUDENT']} />}>
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/student/sessions" element={<StudentSessions />} />
            <Route path="/student/course/:courseId" element={<StudentCourseDetails />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ROLE_TEACHER', 'ROLE_ADMIN']} />}>
            <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/course/:courseId" element={<TeacherCourseDetails />} />
            <Route path="/teacher/course/:courseId/create-session" element={<TeacherSessionCreate />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
