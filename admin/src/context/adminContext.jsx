import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const adminContext = createContext();

const AdminProvider = (props) => {

  const [adminLogin, setAdminLogin] = useState(false);

  useEffect(() => {

    const token = localStorage.getItem("adminToken");

    if (token) {
      setAdminLogin(true);

      // Restore Authorization header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

  }, []);

  const backendUrl =import.meta.env.VITE_backend_Url;

  const value = { adminLogin, setAdminLogin,backendUrl };

  return (
    <adminContext.Provider value={value}>
      {props.children}
    </adminContext.Provider>
  );
};

export default AdminProvider;