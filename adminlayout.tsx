import "./admin.css";

export default function AdminLayout({ children }: any) {
  return (
    <div className="admin-layout">
      <div className="sidebar">
        <h3>Admin Panel</h3>
        <a href="/admin/dashboard">Dashboard</a>
        <a href="/admin/users">Users</a>
        <a href="/admin/attendance">Attendance</a>
        <a href="/admin/reports">Reports</a>
      </div>

      <div className="content">
        {children}
      </div>
    </div>
  );
}
