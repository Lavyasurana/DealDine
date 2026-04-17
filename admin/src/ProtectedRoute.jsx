import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { adminContext } from "./context/adminContext";

export const ProtectedRoute = ({ children }) => {
  const { adminLogin, authReady } = useContext(adminContext);

  if (!authReady) {
    return <div className="p-10 text-center text-gray-500">Checking session...</div>;
  }

  if (!adminLogin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
