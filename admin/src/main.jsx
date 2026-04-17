import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import AdminProvider from './context/adminContext.jsx'
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = "csrf_token";
axios.defaults.xsrfHeaderName = "x-csrf-token";
axios.defaults.withXSRFToken = true;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
  <AdminProvider>
    <App />
    </AdminProvider>
    </BrowserRouter>
  </StrictMode>,
)
