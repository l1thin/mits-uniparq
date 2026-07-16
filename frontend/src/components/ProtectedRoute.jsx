import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        setAuthorized(false);
      } else {
        setAuthorized(true);
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) return null;

  if (!authorized) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;
