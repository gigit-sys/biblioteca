import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const API_URL =
  process.env.REACT_APP_ENV === "local"
    ? process.env.REACT_APP_API_LOCAL
    : process.env.REACT_APP_API_REMOTE;

const ListaLibri = () => {
  const [libri, setLibri] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [filtroStato, setFiltroStato] = useState("tutti");
  const [filtroPagamento, setFiltroPagamento] = useState("tutti");
  const [sortBy, setSortBy] = useState("titolo");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState(null);
  const { logoutUser } = useAuth();

  const navigate = useNavigate();

  const fetchLibri = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get(`${API_URL}/libreria`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLibri(res.data);
    } catch (err) {
      setErrore("Accesso negato o errore nel recupero dei libri.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibri();
  }, []);

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const handleDelete = async (id) => {
    const conferma = window.confirm("Sei sicuro di voler eliminare questo libro?");
    if (!conferma) return;

    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`${API_URL}/libreria/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLibri((prev) => prev.filter((libro) => libro.id !== id));
    } catch (err) {
      alert("Errore durante l'eliminazione del libro.");
      console.error(err);
    }
  };

  const togglePagato = async (id) => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.patch(`${API_URL}/libreria/${id}/toggle-pagato`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchLibri();
    } catch (err) {
      console.error("Errore nel toggle pagato:", err);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  const exportExcel = () => {
    const rows = [
      ["Titolo", "Autore", "Casa Editrice", "Stato", "Pagato", "Prezzo", "Data Vendita"],
      ...filteredAndSortedLibri.map((libro) => [
        libro.titolo,
        libro.autore,
        libro.casa_editrice,
        libro.venduto ? "Venduto" : "Disponibile",
        libro.venduto ? (libro.pagato ? "✅ Pagato" : "⏳ In attesa") : "-",
        libro.venduto ? libro.prezzo_v?.toFixed(2) : "",
        libro.venduto && libro.data_vendita
          ? new Date(libro.data_vendita).toLocaleDateString()
          : "",
      ]),
    ];

    const totaleVenduto = filteredAndSortedLibri
      .filter((libro) => libro.venduto)
      .reduce((acc, libro) => acc + (libro.prezzo_v || 0), 0);

    rows.push([]);
    rows.push(["", "", "", "", "Totale Venduto", totaleVenduto.toFixed(2), ""]);

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Libri");
    XLSX.writeFile(workbook, "libri.xlsx");
  };

  const filteredAndSortedLibri = libri
    .filter((libro) => {
      const matchText = [libro.titolo, libro.autore]
        .join(" ")
        .toLowerCase()
        .includes(filtro.toLowerCase());

      const matchStato =
        filtroStato === "tutti" ||
        (filtroStato === "venduti" && libro.venduto) ||
        (filtroStato === "disponibili" && !libro.venduto);

      const matchPagato =
        filtroPagamento === "tutti" ||
        (filtroPagamento === "pagati" && libro.pagato) ||
        (filtroPagamento === "non_pagati" && !libro.pagato);

      return matchText && matchStato && matchPagato;
    })
    .sort((a, b) => {
      const valA = a[sortBy] || "";
      const valB = b[sortBy] || "";

      if (sortBy === "data_vendita") {
        return sortOrder === "asc"
          ? new Date(valA) - new Date(valB)
          : new Date(valB) - new Date(valA);
      }

      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });

  const totaleLibri = libri.length;  
  const venduti = libri.filter((l) => l.venduto);
  const pagati = venduti.filter((l) => l.pagato);
  const nonPagati = venduti.filter((l) => !l.pagato);
  const totalePagato = pagati.reduce((acc, l) => acc + (l.prezzo_v || 0), 0);
  const totaleDaIncassare = nonPagati.reduce((acc, l) => acc + (l.prezzo_v || 0), 0);

  if (loading) return <p>Caricamento...</p>;
  if (errore) return <p>{errore}</p>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">🐁📚 Libri presenti</h2>
        <div>
          <button className="btn btn-success" onClick={() => navigate("/libri/aggiungi")}>
            ➕ Aggiungi Libro
          </button>
          <button className="btn btn-danger ms-2" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Riepilogo vendite */}
  <div className="alert alert-info">
  <div className="row text-center fw-bold">
    <div className="col-md-2">📚 Totale: {totaleLibri}</div>
    <div className="col-md-2">📦 Venduti: {venduti.length}</div>
    <div className="col-md-2">✅ Pagati: {pagati.length}</div>
    <div className="col-md-2">⏳ Da incassare: {totaleDaIncassare.toFixed(2)} €</div>
    <div className="col-md-2">💶 Incassato: {totalePagato.toFixed(2)} €</div>
  </div>
</div>


      {/* Filtri */}
      <div className="row mb-3">
        <div className="col-md-4 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Cerca per titolo o autore..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        <div className="col-md-4 mb-2">
          <select
            className="form-select"
            value={filtroStato}
            onChange={(e) => setFiltroStato(e.target.value)}
          >
            <option value="tutti">Tutti</option>
            <option value="disponibili">Solo disponibili</option>
            <option value="venduti">Solo venduti</option>
          </select>
        </div>
        <div className="col-md-4 mb-2">
          <select
            className="form-select"
            value={filtroPagamento}
            onChange={(e) => setFiltroPagamento(e.target.value)}
          >
            <option value="tutti">Tutti</option>
            <option value="pagati">Solo pagati</option>
            <option value="non_pagati">Solo non pagati</option>
          </select>
        </div>
      </div>

      <div className="text-end mb-3">
        <button className="btn btn-outline-secondary" onClick={exportExcel}>
          📤 Esporta Excel
        </button>
      </div>
      <div className="table-responsive">
        <table className="table table-striped table-bordered text-center align-middle">
          <thead className="table-dark">
            <tr>
              <th onClick={() => handleSort("titolo")} style={{ cursor: "pointer" }}>
                Titolo {sortBy === "titolo" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th>Autore</th>
              <th>Casa Editrice</th>
              <th>Stato</th>
              <th>Prezzo (€)</th>
              <th onClick={() => handleSort("data_vendita")} style={{ cursor: "pointer" }}>
                Data Vendita {sortBy === "data_vendita" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th>Pagato</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedLibri.map((libro) => (
              <tr
                key={libro.id}
                style={{ backgroundColor: libro.pagato ? "#d4edda" : "inherit" }}
              >
                <td>{libro.titolo}</td>
                <td>{libro.autore}</td>
                <td>{libro.casa_editrice}</td>
                <td>{libro.venduto ? "Venduto" : "Disponibile"}</td>
                <td>{libro.venduto ? libro.prezzo_v?.toFixed(2) : "-"}</td>
                <td>
                  {libro.venduto && libro.data_vendita
                    ? new Date(libro.data_vendita).toLocaleDateString()
                    : "-"}
                </td>
                <td>
                  {libro.venduto ? (
                    <span
                      className={`badge rounded-pill bg-${libro.pagato ? "success" : "warning"} text-dark`}
                      style={{ cursor: "pointer" }}
                      onClick={() => togglePagato(libro.id)}
                    >
                      {libro.pagato ? "✅ Pagato" : "⏳ In attesa"}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => navigate(`/libri/modifica/${libro.id}`)}
                  >
                    ✏️ Modifica
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(libro.id)}
                  >
                    🗑️ Elimina
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListaLibri;
