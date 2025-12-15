import React, { useState } from 'react';

// =========================
// Utility validation helpers
// =========================
const isValidEmail = (email: string): boolean => {
  // Simple and beginner-friendly email regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isStrongPassword = (password: string): boolean => {
  // Minimum 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special char
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password);
};

// =========================
// LOGIN COMPONENT
// =========================
type LoginProps = {
  onLogin?: () => void;
};

export function Login({ onLogin }: LoginProps): React.ReactElement {
  // local UI state
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showSignup, setShowSignup] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // 👉 Place your LOGIN API endpoint here
  const LOGIN_API_URL = 'http://172.20.96.247:8081/api/auth/login';

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Email validation
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Password validation
    if (!password) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    // Payload to send to backend
    const payload = {
      email,
      password,
    };

    

    // Otherwise perform a real POST request
    try {
      const resp = await fetch(LOGIN_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        // Try to parse error message if available
        let msg = `Login failed (${resp.status})`;
        try {
          const body = await resp.json();
          if (body && body.message) msg = String(body.message);
        } catch (_) {
          /* ignore parse errors */
        }
        setError(msg);
        setLoading(false);
        return;
      }

      // Parse response body to detect success even if server replies 200
      let body: any = null;
      try {
        body = await resp.json();
      } catch (_) {
        body = null;
      }

      // If the API explicitly indicates failure (e.g., { success: false, message })
      if (body && body.success === false) {
        setError(String(body.message || 'Invalid credentials'));
        setLoading(false);
        return;
      }

      // If the API returns an error message but still 200, treat it as failure
      if (body && (body.message || body.error) && !body.token && body.success !== true) {
        setError(String(body.message || body.error));
        setLoading(false);
        return;
      }

      // Consider the login successful if we received a token or an explicit success flag,
      // otherwise fall back to treating 2xx with no body as success.
      const loginSuccess = Boolean(
        (body && (body.token || body.accessToken)) || body?.success === true || body === null
      );

      if (!loginSuccess) {
        setError('Invalid credentials');
        setLoading(false);
        return;
      }

      // Success — store token and any returned user info, then notify parent
      const storeAuthFromBody = (b: any) => {
        const token = b?.token ?? b?.accessToken;
        if (token) localStorage.setItem('token', token);
        if (b?.email) localStorage.setItem('email', b.email);
        if (b?.username) localStorage.setItem('username', b.username);
        if (b?.role) {
          // Role may be an object (Role) or string
          if (typeof b.role === 'string') localStorage.setItem('role', b.role);
          else if (b.role?.name) localStorage.setItem('role', b.role.name);
          else localStorage.setItem('role', JSON.stringify(b.role));
        }
        if (b?.studentId) localStorage.setItem('studentId', b.studentId);
        if (b?.teacherId) localStorage.setItem('teacherId', b.teacherId);
      };

      storeAuthFromBody(body);

      if (onLogin) onLogin();
    } catch (err: any) {
      setError('Network error: ' + (err?.message ?? String(err)));
    } finally {
      setLoading(false);
    }
  };

  if (showSignup) {
    // Render Signup in-place if the user toggles to sign up
    return (
      <Signup
        // after signup: if backend returns a token, store and log in;
        // otherwise return to the login screen
        onSignupSuccess={(token?: string) => {
          if (token) {
            localStorage.setItem('token', token);
            if (onLogin) onLogin();
          } else {
            setShowSignup(false);
          }
        }}
      />
    );
  }

  return (
    <div className="login-container d-flex align-items-stretch">
      <div className="vertical-accent d-none d-sm-block me-3" />
      <div className="card login-card w-100">
        <div className="card-body">
          <h2 className="h4 fw-bold mb-3">Login</h2>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="mb-3 text-start">
              <label className="form-label">Email</label>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="mb-3 text-start">
              <label className="form-label">Password</label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-100 btn-login-text"
            >
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </form>

          <div className="mt-3 d-flex flex-column align-items-center">
            <button
              className="btn btn-link p-0"
              onClick={() => setShowSignup(true)}
            >
              Don't have an account? Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================
// SIGNUP COMPONENT
// =========================
type SignupProps = {
  onSignupSuccess?: (token?: string) => void;
};

export function Signup({ onSignupSuccess }: SignupProps): React.ReactElement {
  const faculties: string[] = ['Science', 'FCMS', 'Arts', 'FCT'];

  const degreePrograms: string[] = [
    'ECSC',
    'PE',
    'MIT',
    'Applied Chemistry',
    'PS',
    'BS',
    'ENCM',
    'SS',
    'SE',
  ];

  // Default `faculty` to Science and default degree program to first option
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    department: '',
    faculty: 'Science',
    degreeProgram: '',
  });

  const [error, setError] = useState('');
  const [signupLoading, setSignupLoading] = useState<boolean>(false);

  // 👉 Place your SIGNUP API endpoint here
  const SIGNUP_API_URL = 'http://localhost:8081/api/auth/register';

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === 'faculty') {
        // If faculty changes away from Science, clear degreeProgram
        return {
          ...prev,
          faculty: value,
          degreeProgram: value === 'Science' ? prev.degreeProgram : '',
        } as typeof prev;
      }

      return { ...prev, [name]: value } as typeof prev;
    });
  };

  const handleSignup = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setError('');
    setSignupLoading(true);

    // Basic validations
    if (!formData.fullName) {
      setError('Full name is required');
      setSignupLoading(false);
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      setSignupLoading(false);
      return;
    }

    if (!isStrongPassword(formData.password)) {
      setError(
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
      );
      setSignupLoading(false);
      return;
    }

    if (!formData.faculty) {
      setError('Please select a faculty');
      setSignupLoading(false);
      return;
    }

    if (formData.faculty === 'Science' && !formData.degreeProgram) {
      setError('Please select a degree program for Science faculty');
      setSignupLoading(false);
      return;
    }
    // Payload to send to backend
    const payload = { ...formData };

    // If the SIGNUP_API_URL isn't configured, simulate success
    if (!SIGNUP_API_URL || SIGNUP_API_URL.includes('PASTE_SIGNUP_API_URL_HERE')) {
      await new Promise((r) => setTimeout(r, 700));
      setSignupLoading(false);
      if (onSignupSuccess) onSignupSuccess();
      return;
    }

    // Real network request
    try {
      const resp = await fetch(SIGNUP_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        let msg = `Signup failed (${resp.status})`;
        try {
          const body = await resp.json();
          if (body && body.message) msg = String(body.message);
        } catch (_) {}
        setError(msg);
        setSignupLoading(false);
        return;
      }

      let body: any = null;
      try {
        body = await resp.json();
      } catch (_) {
        body = null;
      }

      if (body && body.success === false) {
        setError(String(body.message || 'Signup failed'));
        setSignupLoading(false);
        return;
      }

      if (body && (body.message || body.error) && body.success !== true) {
        setError(String(body.message || body.error));
        setSignupLoading(false);
        return;
      }

      // Success - store returned auth info and forward token if provided
      const storeAuthFromBody = (b: any) => {
        const token = b?.token ?? b?.accessToken;
        if (token) localStorage.setItem('token', token);
        if (b?.email) localStorage.setItem('email', b.email);
        if (b?.username) localStorage.setItem('username', b.username);
        if (b?.role) {
          if (typeof b.role === 'string') localStorage.setItem('role', b.role);
          else if (b.role?.name) localStorage.setItem('role', b.role.name);
          else localStorage.setItem('role', JSON.stringify(b.role));
        }
        if (b?.studentId) localStorage.setItem('studentId', b.studentId);
        if (b?.teacherId) localStorage.setItem('teacherId', b.teacherId);
      };

      storeAuthFromBody(body);

      if (onSignupSuccess) onSignupSuccess(body?.token ?? body?.accessToken);
    } catch (err: any) {
      setError('Network error: ' + (err?.message ?? String(err)));
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="login-container d-flex align-items-stretch">
      <div className="vertical-accent d-none d-sm-block me-3" />
      <div className="card login-card w-100">
        <div className="card-body">
          <h2 className="h4 fw-bold mb-3">Sign Up</h2>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSignup}>
            <div className="mb-2">
              <label className="form-label" htmlFor="signup-fullName">Full Name</label>
              <input id="signup-fullName" name="fullName" placeholder="John Doe" value={formData.fullName} onChange={handleChange} className="form-control" />
            </div>

            <div className="mb-2">
              <label className="form-label" htmlFor="signup-email">Email</label>
              <input id="signup-email" type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} className="form-control" />
            </div>

            <div className="mb-2">
              <label className="form-label" htmlFor="signup-password">Password</label>
              <input id="signup-password" type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} className="form-control" />
            </div>

            <div className="mb-2">
              <label className="form-label" htmlFor="signup-department">Department</label>
              <input id="signup-department" type="text" name="department" placeholder="Department" value={formData.department} onChange={handleChange} className="form-control" />
            </div>

            <div className="row">
              <div className="col-md-6 mb-2">
                <label className="form-label">Faculty</label>
                <select aria-label="Faculty" name="faculty" value={formData.faculty} onChange={handleChange} className="form-select">
                  <option value="">Select Faculty</option>
                  {faculties.map((fac) => (
                    <option key={fac} value={fac}>
                      {fac}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6 mb-2">
                <label className="form-label">Degree Program</label>
                <select
                  aria-label="Degree Program"
                  name="degreeProgram"
                  value={formData.degreeProgram}
                  onChange={handleChange}
                  className="form-select"
                  disabled={formData.faculty !== 'Science'}
                >
                  {formData.faculty !== 'Science' ? (
                    <option value="">Not available for selected faculty</option>
                  ) : (
                    <>
                      <option value="">Select Degree Program</option>
                      {degreePrograms.map((prog) => (
                        <option key={prog} value={prog}>
                          {prog}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="d-grid gap-2 mt-3">
              <button type="submit" disabled={signupLoading} className="btn btn-success">
                {signupLoading ? 'Signing up…' : 'Sign Up'}
              </button>
            </div>
          </form>

          <div className="mt-3 text-center">
            <button className="btn btn-link p-0" onClick={() => onSignupSuccess?.()}>
              Already have an account? Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
