import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const BASE_URL =
  process.env.REACT_APP_ENV === "local"
    ? process.env.REACT_APP_API_LOCAL
    : process.env.REACT_APP_API_REMOTE;

const ModificaLibro = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [titolo, setTitolo] = useState("");
  const [autore, setAutore] = useState("");
  const [casaEditrice, setCasaEditrice] = useState("");
  const [venduto, setVenduto] = useState(false);
  const [prezzoVendita, setPrezzoVendita] = useState("");
  const [dataVendita, setDataVendita] = useState("");
  const [errore, setErrore] = useState(null);
  const [caricamento, setCaricamento] = useState(true);

  useEffect(() => {
    const fetchLibro = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get(`${BASE_URL}/libreria/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const libro = res.data;
        setTitolo(libro.titolo || "");
        setAutore(libro.autore || "");
        setCasaEditrice(libro.casa_editrice || "");
        setVenduto(libro.venduto || false);
        setPrezzoVendita(
          typeof libro.prezzo_v === "number" ? libro.prezzo_v.toString() : ""
        );
        setDataVendita(
          libro.data_vendita && typeof libro.data_vendita === "string"
            ? libro.data_vendita.slice(0, 10)
            : ""
        );
      } catch (err) {
        setErrore("Errore nel recuperare i dati del libro.");
        console.error(err);
      } finally {
        setCaricamento(false);
      }
    };

    fetchLibro();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("access_token");
    if (!token) {
      setErrore("Non sei autenticato.");
      return;
    }

    try {
      await axios.put(
        `${BASE_URL}/libreria/${id}`,
        {
          titolo,
          autore,
          casa_editrice: casaEditrice,
          venduto,
          prezzo_v: venduto ? parseFloat(prezzoVendita) : null,
          data_vendita:
            venduto && dataVendita ? new Date(dataVendita).toISOString() : null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/libri");
    } catch (err) {
      setErrore("Errore durante la modifica del libro.");
      console.error(err);
    }
  };

  if (caricamento) return <p>Caricamento dati...</p>;
  if (errore) return <p className="text-danger">{errore}</p>;

  return (
    <div className="container mt-4">
      <h2>✏️ Modifica libro</h2>
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
            onChange={(e) => setVenduto(e.target.checked)}
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
                value={prezzoVendita || ""}
                onChange={(e) => setPrezzoVendita(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label>Data di Vendita</label>
              <input
                type="date"
                className="form-control"
                value={dataVendita || ""}
                onChange={(e) => setDataVendita(e.target.value)}
                required
              />
            </div>
          </>
        )}

        <div className="d-flex justify-content-between">
          <button type="submit" className="btn btn-primary">
            💾 Salva Modifiche
          </button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => navigate("/libri")}
          >
            ⬅ Annulla
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModificaLibro;
