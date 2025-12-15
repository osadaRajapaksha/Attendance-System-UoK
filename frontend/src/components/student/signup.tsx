import React, { useState } from "react";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";

// =========================
// Utility validation helpers
// =========================
const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isStrongPassword = (password: string): boolean =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password);

type SignupProps = {
  onSignupSuccess?: (token?: string) => void;
};

export default function Signup({ onSignupSuccess }: SignupProps) {
  const faculties = ["Science", "FCMS", "Arts", "FCT"];
  const degreePrograms = [
    "ECSC", "PE", "MIT", "Applied Chemistry",
    "PS", "BS", "ENCM", "SS", "SE",
  ];

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    department: "",
    faculty: "Science",
    degreeProgram: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const SIGNUP_API_URL = "http://localhost:8081/api/auth/register";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.fullName) return setError("Full name is required");
    if (!isValidEmail(formData.email)) return setError("Invalid email");
    if (!isStrongPassword(formData.password))
      return setError("Password not strong enough");
    if (formData.faculty === "Science" && !formData.degreeProgram)
      return setError("Select degree program");

    try {
      const resp = await fetch(SIGNUP_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!resp.ok) {
        const body = await resp.json();
        setError(body?.message || "Signup failed");
        return;
      }

      const body = await resp.json();
      const token = body?.token ?? body?.accessToken;
      if (token) localStorage.setItem("token", token);

      onSignupSuccess?.(token);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="card shadow-lg border-0"
        style={{ maxWidth: 460, width: "100%", borderRadius: 16 }}
      >
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <h2 className="fw-bold" style={{ color: "#6b1d1d" }}>
              eKelaniya
            </h2>
            <p className="text-muted mb-0">Create Account</p>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSignup}>
            <input
              name="fullName"
              placeholder="Full Name"
              className="form-control form-control-lg mb-2"
              onChange={handleChange}
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              className="form-control form-control-lg mb-2"
              onChange={handleChange}
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              className="form-control form-control-lg mb-2"
              onChange={handleChange}
            />

            <input
              name="department"
              placeholder="Department"
              className="form-control form-control-lg mb-2"
              onChange={handleChange}
            />

            <select
              name="faculty"
              className="form-select form-select-lg mb-2"
              value={formData.faculty}
              onChange={handleChange}
            >
              {faculties.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>

            <select
              name="degreeProgram"
              disabled={formData.faculty !== "Science"}
              className="form-select form-select-lg mb-3"
              onChange={handleChange}
            >
              <option value="">Select Degree Program</option>
              {degreePrograms.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>

            <button
              className="btn btn-primary btn-lg w-100"
              disabled={loading}
            >
              {loading ? "Signing up…" : "Sign Up"}
            </button>
          </form>

          <div className="text-center mt-3">
            <button
              className="btn btn-link"
              onClick={() => onSignupSuccess?.()}
            >
              Already have an account? Login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
