import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import HomePage from "./pages/HomePage";
import ListaLibri from "./pages/ListaLibri";
import AggiungiLibro from "./pages/AggiungiLibro";
import ModificaLibro from "./pages/ModificaLibro.js";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>              
            }
          />
         <Route
  path="/libri"
  element={
    <ProtectedRoute>
      <ListaLibri />
    </ProtectedRoute>
  }
/>
         <Route
  path="/libri/aggiungi"
  element={
    <ProtectedRoute>
      <AggiungiLibro />
    </ProtectedRoute>
  }
/>
         {/* Nuova route per la modifica */}
         <Route
  path="/libri/modifica/:id"
  element={
    <ProtectedRoute>
      <ModificaLibro />
    </ProtectedRoute>
  }
/>
          {/* Rimosso /login */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;