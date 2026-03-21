import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { adminContext } from "./context/adminContext";

export const ProtectedRoute = ({ children }) => {
  const { adminLogin } = useContext(adminContext);

  if (!adminLogin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};