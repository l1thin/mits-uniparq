import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

// Lazy load pages for code splitting to reduce unused JavaScript
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const ClearwayApp = lazy(() => import("./components/ClearwayApp"));

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
    <div className="spinner"></div>
  </div>
);

function App() {
  return (
    <Router>
      <Navbar />

      <main>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
          {/* Root: legacy login page (keeps existing behavior) */}
          <Route path="/" element={<Login />} />

          {/* Also provide the new Clearway UI at /clearway for the converted design */}
          <Route path="/clearway" element={<ClearwayApp />} />

          {/* Security Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Panel */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          {/* Redirect Unknown Routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        </Suspense>
      </main>
    </Router>
  );
}

export default App;

