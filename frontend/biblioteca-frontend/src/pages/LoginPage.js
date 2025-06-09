import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Prende l'URL base dall'ambiente (local o remote)
const BASE_URL =
  process.env.REACT_APP_ENV === "local"
    ? process.env.REACT_APP_API_LOCAL
    : process.env.REACT_APP_API_REMOTE;

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isExpired = new URLSearchParams(location.search).get("expired");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Login fallito");
      }

      const data = await response.json();
      loginUser(data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h2 className="mb-4 text-center">Login</h2>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {isExpired && (
        <div className="alert alert-warning" role="alert">
          Sessione scaduta, accedi di nuovo.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="form-control"
            placeholder="Inserisci la tua email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="form-control"
            placeholder="Inserisci la tua password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Accedi
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
