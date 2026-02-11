'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password || !confirmPassword || !name || (role === 'student' && !studentId)) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      // Call the signup API route
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, studentId: role === 'student' ? studentId : undefined, role }),
      });

      const result = await response.json();
      
      if (!result.success) {
        setError(result.error || 'Sign up failed');
        return;
      }

      // Show success message and redirect to login
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px"
    }}>
      <div style={{
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        width: "100%",
        maxWidth: "420px",
        padding: "40px"
      }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{
            width: "80px",
            height: "80px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 15px",
            fontSize: "36px",
            color: "white"
          }}>🏥</div>
          <h1 style={{ color: "#333", fontSize: "28px", marginBottom: "8px" }}>Create Account</h1>
          <p style={{ color: "#666", fontSize: "14px" }}>Clinical Management System</p>
        </div>

        {error && (
          <div style={{
            background: "#fee",
            border: "2px solid #f99",
            borderRadius: "10px",
            padding: "12px",
            marginBottom: "20px",
            color: "#c33",
            fontSize: "14px"
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: "#e7f5e7",
            border: "2px solid #4caf50",
            borderRadius: "10px",
            padding: "12px",
            marginBottom: "20px",
            color: "#2e7d32",
            fontSize: "14px",
            textAlign: "center"
          }}>
            ✓ Account created successfully! Redirecting to sign in...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", color: "#333", fontWeight: 500, marginBottom: "8px", fontSize: "14px" }}>
              Name
            </label>
            <input 
              type="text" 
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required 
              style={{ width: "100%", padding: "12px 15px", border: "2px solid #e0e0e0", borderRadius: "10px", fontSize: "15px" }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", color: "#333", fontWeight: 500, marginBottom: "8px", fontSize: "14px" }}>
              Email
            </label>
            <input 
              type="email" 
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required 
              style={{ width: "100%", padding: "12px 15px", border: "2px solid #e0e0e0", borderRadius: "10px", fontSize: "15px" }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", color: "#333", fontWeight: 500, marginBottom: "8px", fontSize: "14px" }}>
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
              required
              style={{ width: "100%", padding: "12px 15px", border: "2px solid #e0e0e0", borderRadius: "10px", fontSize: "15px" }}
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
            </select>
          </div>

          {role === 'student' && (
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", color: "#333", fontWeight: 500, marginBottom: "8px", fontSize: "14px" }}>
                Student ID
              </label>
              <input 
                type="text" 
                placeholder="Enter your student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                disabled={loading}
                required 
                style={{ width: "100%", padding: "12px 15px", border: "2px solid #e0e0e0", borderRadius: "10px", fontSize: "15px" }}
              />
            </div>
          )}

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", color: "#333", fontWeight: 500, marginBottom: "8px", fontSize: "14px" }}>
              Password
            </label>
            <input 
              type="password" 
              placeholder="Enter your password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required 
              style={{ width: "100%", padding: "12px 15px", border: "2px solid #e0e0e0", borderRadius: "10px", fontSize: "15px" }}
            />
          </div>

          <div style={{ marginBottom: "25px" }}>
            <label style={{ display: "block", color: "#333", fontWeight: 500, marginBottom: "8px", fontSize: "14px" }}>
              Confirm Password
            </label>
            <input 
              type="password" 
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required 
              style={{ width: "100%", padding: "12px 15px", border: "2px solid #e0e0e0", borderRadius: "10px", fontSize: "15px" }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              background: loading ? "#999" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              marginBottom: "15px",
              opacity: loading ? 0.7 : 1
            }}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "25px", color: "#666", fontSize: "13px" }}>
          Already have an account? <a href="/login" style={{ color: "#667eea", fontWeight: 600, textDecoration: "none" }}>Sign In</a>
        </div>
      </div>
    </div>
  );
}
