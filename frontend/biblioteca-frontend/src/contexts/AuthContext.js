import React, { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          throw new Error("Token scaduto");
        }
      setUser({ email: decoded.sub, role: decoded.role, token });
      } catch (err) {
        console.warn("Token non valido o scaduto:", err.message);
        localStorage.removeItem("access_token");
        setUser(null);
      }
    }
  }, []);

  const loginUser = (token) => {
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        throw new Error("Token scaduto");
      }
      localStorage.setItem("access_token", token);
      setUser({ email: decoded.sub, role: decoded.role });
    } catch (err) {
      console.error("Errore nel token di login:", err.message);
      localStorage.removeItem("access_token");
      setUser(null);
    }
  };

  const logoutUser = () => {
    localStorage.removeItem("access_token");
    setUser(null);
    // NO navigate qui
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;

