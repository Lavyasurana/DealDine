import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const adminContext = createContext();

const AdminProvider = (props) => {

  const [adminLogin, setAdminLogin] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const navigate=useNavigate();
  const backendUrl =import.meta.env.VITE_backend_Url;

  useEffect(() => {
    const initSession = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/admin/me`, { withCredentials: true });
        setAdminLogin(Boolean(response.data?.success));
      } catch (_error) {
        setAdminLogin(false);
      } finally {
        setAuthReady(true);
      }
    };
    initSession();
  }, [backendUrl]);

  const value = { adminLogin, setAdminLogin, authReady, backendUrl, navigate };

  return (
    <adminContext.Provider value={value}>
      {props.children}
    </adminContext.Provider>
  );
};

export default AdminProvider;
