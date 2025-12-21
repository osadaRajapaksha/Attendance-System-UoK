import "./admin.css";

export default function AdminLogin() {
  return (
    <div className="login-box">
      <h2>Admin Login</h2>
      <input type="text" placeholder="Username" /><br /><br />
      <input type="password" placeholder="Password" /><br /><br />
      <button>Login</button>
    </div>
  );
}
