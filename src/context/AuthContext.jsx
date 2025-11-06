// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    // vamos a parsear de forma segura
    if (storedToken && storedUser && storedUser !== "undefined") {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (err) {
        console.warn("No pude parsear el user del localStorage, lo limpio:", err);
        localStorage.removeItem("user");
        setUser(null);
      }
    } else {
      // si no hay user válido, nos aseguramos de que no quede basura
      if (storedUser === "undefined") {
        localStorage.removeItem("user");
      }
      setUser(null);
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.login(email, password);
      // asumo que tu backend devuelve { token, user }
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);
      return response;
    } catch (error) {
      // aquí puedes poner un toast o algo
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const backendData = {
        name: userData.nombres + " " + userData.apellidos,
        email: userData.email,
        password: userData.password,
        role: userData.rol === "docente" ? "TEACHER" : "STUDENT",
        code: userData.codigo,
      };

      const response = await api.register(backendData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
