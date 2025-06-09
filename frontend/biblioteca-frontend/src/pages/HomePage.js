import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import sfondo from "../images/mignol.jpg";

const BASE_URL =
  process.env.REACT_APP_ENV === "local"
    ? process.env.REACT_APP_API_LOCAL
    : process.env.REACT_APP_API_REMOTE;

const HomePage = () => {
  const { user, loginUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/libri" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${sfondo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingLeft: "5%",
      }}
    >
      <div
        style={{
          maxWidth: 400,
          width: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          padding: "2rem",
          borderRadius: "8px",
          color: "white",
        }}
      >
        <h1 className="mb-4 text-center">Benvenuto in Mignola&Profs</h1>
        <p className="lead text-center">
          Accedi per gestire la tua collezione di libri.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>{" "}
                Caricamento...
              </>
            ) : (
              "Accedi"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HomePage;
