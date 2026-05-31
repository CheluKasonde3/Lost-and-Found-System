import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import { Login } from "./pages/Login";
import Register from "./pages/Register";
import Items from "./pages/Items";
import ItemDetail from "./pages/ItemDetail";
import ReportItem from "./pages/ReportItem";
import EditItem from "./pages/EditItem";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import MyClaims from "./pages/MyClaims";
import "./styles.css";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading)
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/" />;
  return children;
}

function NonAdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading)
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  if (!user) return <Navigate to="/login" />;
  if (isAdmin) return <Navigate to="/dashboard" />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/items" element={<Items />} />
          <Route path="/items/:id" element={<ItemDetail />} />
          <Route
            path="/report"
            element={
              <NonAdminRoute>
                <ReportItem />
              </NonAdminRoute>
            }
          />
          <Route
            path="/items/:id/edit"
            element={
              <PrivateRoute>
                <EditItem />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-claims"
            element={
              <NonAdminRoute>
                <MyClaims />
              </NonAdminRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
