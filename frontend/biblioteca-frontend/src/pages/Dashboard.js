import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  const handleViewBooks = () => {
    navigate("/libri");
  };

  const handleAddBook = () => {
    navigate("/libri/aggiungi"); // lo prepareremo dopo
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-3">Benvenuto, {user?.email}</h1>
      <p>Ruolo: <strong>{user?.role}</strong></p>

      <div className="d-flex gap-3 mt-4">
        <button className="btn btn-primary" onClick={handleViewBooks}>
          📚 Visualizza Libri
        </button>
        <button className="btn btn-success" onClick={handleAddBook}>
          ➕ Aggiungi Libro
        </button>
        <button className="btn btn-danger ms-auto" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
