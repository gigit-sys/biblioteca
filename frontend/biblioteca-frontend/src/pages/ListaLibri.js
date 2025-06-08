import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ListaLibri = () => {
  const [libri, setLibri] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [filtroStato, setFiltroStato] = useState("tutti");
  const [sortBy, setSortBy] = useState("titolo");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState(null);
  const { user, logoutUser } = useAuth();

  const navigate = useNavigate();

  const fetchLibri = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get("http://localhost:8000/libreria", {
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
    await axios.delete(`http://localhost:8000/libreria/${id}`, {
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

 const handleLogout = () => {
    logoutUser();
    navigate("/");
  };
const exportExcel = () => {
  const rows = [
    ["Titolo", "Autore", "Casa Editrice", "Stato", "Prezzo", "Data Vendita"],
    ...filteredAndSortedLibri.map((libro) => [
      libro.titolo,
      libro.autore,
      libro.casa_editrice,
      libro.venduto ? "Venduto" : "Disponibile",
      libro.venduto ? libro.prezzo_v?.toFixed(2) : "",
      libro.venduto && libro.data_vendita
        ? new Date(libro.data_vendita).toLocaleDateString()
        : "",
    ]),
  ];

  // Calcola totale venduto
  const totaleVenduto = filteredAndSortedLibri
    .filter((libro) => libro.venduto)
    .reduce((acc, libro) => acc + (libro.prezzo_v || 0), 0);

  // Aggiungi riga vuota e riga totale
  rows.push([]);
  rows.push(["", "", "", "Totale Venduto", totaleVenduto.toFixed(2), ""]);

  // Crea workbook e worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Libri");

  // Esporta file Excel
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

      return matchText && matchStato;
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

  if (loading) return <p>Caricamento...</p>;
  if (errore) return <p>{errore}</p>;

  return (
    <div className="container mt-4">
      {/* Barra superiore */}
      <div className="d-flex justify-content-between align-items-center mb-3">
     <h2 className="mb-0">🐁📚 Libri presenti</h2>
        <div>
          <button
            className="btn btn-success"
            onClick={() => navigate("/libri/aggiungi")}
          >
            ➕ Aggiungi Libro
          </button>
           <button className="btn btn-danger ms-auto" onClick={handleLogout}>
          🚪 Logout
        </button>
        </div>
      </div>

      {/* Filtri */}
      <div className="row mb-3">
        <div className="col-md-6 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Cerca per titolo o autore..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        <div className="col-md-3 mb-2">
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
        <div className="col-md-3 mb-2">
          <button className="btn btn-outline-secondary w-100" onClick={exportExcel}>
            📤 Esporta CSV
          </button>
        </div>
      </div>

      {/* Tabella */}
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
              <th>Azioni</th>
            </tr>
          </thead>
    <tbody>
  {filteredAndSortedLibri.map((libro) => (
    <tr key={libro.id}>
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
