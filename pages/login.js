// This file, login.js, creates the login page for your application.
// It uses pure CSS for styling, without any external frameworks like Tailwind.

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const LoginPage = () => {
  // State variables for managing form input and potential errors
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Handle the email and password form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    // Placeholder for actual login logic (e.g., calling a Firebase or Supabase function)
    console.log('Attempting login with email:', email);
    // Simulate a successful login and redirect
    if (email === 'test@example.com' && password === 'password') {
      router.push('/vessels');
    } else {
      setError('Invalid email or password.');
    }
  };

  // Handle the Google sign-in button click
  const handleGoogleSignIn = async () => {
    setError('');
    // Placeholder for actual Google login logic
    console.log('Attempting login with Google');
    // Simulate a successful login and redirect
    router.push('/vessels');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Log In</h1>
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="input-field"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="input-field"
          />
          <button type="submit" className="login-button">
            Log In
          </button>
        </form>
        <div className="divider">
          <span>OR</span>
        </div>
        <button onClick={handleGoogleSignIn} className="google-button">
          Log in with Google
        </button>
        {error && <p className="error-message">{error}</p>}
        <p className="forgot-password">
          <Link href="#">Forgot password?</Link>
        </p>
      </div>

      {/* CSS-in-JS styling for this component */}
      <style jsx>{`
        .login-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: #e6f0ff; /* Light blue background */
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, sans-serif;
        }

        .login-card {
          background-color: white;
          padding: 3rem;
          border-radius: 12px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1); /* Soft shadow */
          text-align: center;
          max-width: 450px;
          width: 100%;
          transition: transform 0.3s ease;
        }

        .login-card:hover {
          transform: translateY(-5px); /* Subtle hover effect */
        }

        .login-title {
          font-size: 2rem;
          font-weight: 700;
          color: #004d80; /* Niyomarine blue */
          margin-bottom: 2rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .input-field {
          padding: 1rem;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .input-field:focus {
          border-color: #007bff; /* Highlight on focus */
          outline: none;
          box-shadow: 0 0 5px rgba(0, 123, 255, 0.2);
        }

        .login-button {
          padding: 1rem;
          border: none;
          border-radius: 8px;
          background-color: #007bff; /* Primary blue button */
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .login-button:hover {
          background-color: #0056b3;
        }

        .divider {
          position: relative;
          margin: 2rem 0;
          text-align: center;
          color: #aaa;
        }

        .divider span {
          background: white;
          padding: 0 10px;
          position: relative;
          z-index: 1;
        }

        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          border-top: 1px solid #ddd;
          z-index: 0;
        }

        .google-button {
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          background-color: #f7f7f7;
          color: #555;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .google-button:hover {
          background-color: #e8e8e8;
        }

        .error-message {
          color: #ff4d4f; /* Red error message */
          margin-top: 1rem;
        }

        .forgot-password {
          margin-top: 1rem;
          font-size: 0.9rem;
        }

        .forgot-password a {
          color: #007bff;
          text-decoration: none;
          transition: text-decoration 0.3s ease;
        }

        .forgot-password a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
