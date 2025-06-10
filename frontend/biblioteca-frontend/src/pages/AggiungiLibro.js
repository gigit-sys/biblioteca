import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL =
  process.env.REACT_APP_ENV === "local"
    ? process.env.REACT_APP_API_LOCAL
    : process.env.REACT_APP_API_REMOTE;

const AggiungiLibro = () => {
  const [titolo, setTitolo] = useState("");
  const [autore, setAutore] = useState("");
  const [casaEditrice, setCasaEditrice] = useState("");
  const [venduto, setVenduto] = useState(false);
  const [pagato, setPagato] = useState(false);
  const [prezzoVendita, setPrezzoVendita] = useState("");
  const [dataVendita, setDataVendita] = useState("");
  const [errore, setErrore] = useState(null);
  const [successo, setSuccesso] = useState(null);
  const navigate = useNavigate();

  const resetForm = () => {
    setTitolo("");
    setAutore("");
    setCasaEditrice("");
    setVenduto(false);
    setPagato(false);
    setPrezzoVendita("");
    setDataVendita("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("access_token");
    if (!token) {
      setErrore("Non sei autenticato");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/libreria/`,
        {
          titolo,
          autore,
          casa_editrice: casaEditrice,
          venduto,
          pagato: venduto ? pagato : false,
          prezzo_v: venduto ? parseFloat(prezzoVendita) : null,
          data_vendita: venduto && dataVendita ? new Date(dataVendita).toISOString() : null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setErrore(null);
      setSuccesso("✅ Libro aggiunto con successo!");
      resetForm();
    } catch (err) {
      setErrore("Errore durante l'aggiunta del libro");
      console.error(err);
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">📘 Aggiungi un nuovo libro</h2>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/libri")}
        >
          📚 Vai alla Lista Libri
        </button>
      </div>

      {errore && <p className="text-danger">{errore}</p>}
      {successo && <p className="text-success">{successo}</p>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Titolo</label>
          <input
            type="text"
            className="form-control"
            value={titolo}
            onChange={(e) => setTitolo(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label>Autore</label>
          <input
            type="text"
            className="form-control"
            value={autore}
            onChange={(e) => setAutore(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label>Casa Editrice</label>
          <input
            type="text"
            className="form-control"
            value={casaEditrice}
            onChange={(e) => setCasaEditrice(e.target.value)}
            required
          />
        </div>

        <div className="form-check mb-3">
          <input
            type="checkbox"
            className="form-check-input"
            id="vendutoCheck"
            checked={venduto}
            onChange={(e) => {
              setVenduto(e.target.checked);
              if (!e.target.checked) setPagato(false);
            }}
          />
          <label className="form-check-label" htmlFor="vendutoCheck">
            Venduto
          </label>
        </div>

        {venduto && (
          <>
            <div className="mb-3">
              <label>Prezzo di Vendita (€)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                value={prezzoVendita}
                onChange={(e) => setPrezzoVendita(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label>Data di Vendita</label>
              <input
                type="date"
                className="form-control"
                value={dataVendita}
                onChange={(e) => setDataVendita(e.target.value)}
              />
            </div>

            <div className="form-check mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="pagatoCheck"
                checked={pagato}
                onChange={(e) => setPagato(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="pagatoCheck">
                Pagato
              </label>
            </div>
          </>
        )}

        <button type="submit" className="btn btn-success">
          ➕ Aggiungi Libro
        </button>
      </form>
    </div>
  );
};

export default AggiungiLibro;
