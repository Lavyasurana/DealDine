import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { rescueContext } from "./context/rescueContext";

export const ProtectedRoute = ({ children }) => {
  const { userLogin, authReady } = useContext(rescueContext);

  if (!authReady) {
    return <div className="p-6 text-center">Checking your session...</div>;
  }

  if (!userLogin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
