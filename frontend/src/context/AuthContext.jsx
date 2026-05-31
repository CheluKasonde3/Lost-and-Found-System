import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("laf_token"));
  const [loading, setLoading] = useState(true);

  // Set axios default auth header whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("laf_token", token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("laf_token");
    }
  }, [token]);

  // On mount, fetch current user if token exists
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    axios
      .get("/api/auth/me")
      .then((r) => setUser(r.data))
      .catch(() => {
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const login = async (email, password) => {
    const { data } = await axios.post("/api/auth/login", { email, password });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await axios.post("/api/auth/register", payload);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
