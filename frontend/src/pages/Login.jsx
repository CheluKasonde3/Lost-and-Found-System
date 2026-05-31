import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "../components/Icon";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === "admin" ? "/dashboard" : "/");
    } catch (err) {
      setError(
        err.response?.data?.error || "Login failed. Check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="form-card">
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <Icon name="search" size={54} />
          </div>
          <h1 className="form-title" style={{ textAlign: "center" }}>
            Welcome Back
          </h1>
          <p className="form-subtitle" style={{ textAlign: "center" }}>
            Sign in to your ZUT Lost &amp; Found account
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-control"
                type="email"
                placeholder="you@zut.edu.zm"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-control"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
              disabled={loading}
            >
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  Sign In <Icon name="arrowRight" size={16} />
                </>
              )}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: "1.5rem",
              fontSize: "0.9rem",
              color: "var(--text-muted)",
            }}
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{ color: "var(--teal)", fontWeight: 600 }}
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    student_id: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.error || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="form-card">
          <h1 className="form-title">Create Account</h1>
          <p className="form-subtitle">
            Join the ZUT Lost &amp; Found community
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                className="form-control"
                placeholder="e.g. Chanda Mutale"
                value={form.full_name}
                onChange={(e) => set("full_name", e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                className="form-control"
                type="email"
                placeholder="you@zut.edu.zm"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Student ID</label>
                <input
                  className="form-control"
                  placeholder="e.g. ZUT/2023/001"
                  value={form.student_id}
                  onChange={(e) => set("student_id", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  className="form-control"
                  placeholder="e.g. +260 97 123 4567"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                className="form-control"
                type="password"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
              disabled={loading}
            >
              {loading ? (
                "Creating account..."
              ) : (
                <>
                  Create Account <Icon name="arrowRight" size={16} />
                </>
              )}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: "1.5rem",
              fontSize: "0.9rem",
              color: "var(--text-muted)",
            }}
          >
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--teal)", fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
