
import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
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

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_STUDENT']} />}>
          <Route path="/student-dashboard" element={<StudentDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ROLE_TEACHER']} />}>
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>

         {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
}

export default App;
