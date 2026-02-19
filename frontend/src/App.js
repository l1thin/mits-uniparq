import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import ClearwayApp from "./components/ClearwayApp";

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        {/* Root: legacy login page (keeps existing behavior) */}
        <Route path="/" element={<Login />} />

        {/* Also provide the new Clearway UI at /clearway for the converted design */}
        <Route path="/clearway" element={<ClearwayApp />} />

        {/* Security Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="security">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Panel */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        {/* Redirect Unknown Routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;

