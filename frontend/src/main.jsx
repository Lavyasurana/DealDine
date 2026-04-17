import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from "axios";

import App from './App.jsx'
import RescueProvider from './context/rescueContext.jsx'
import { BrowserRouter } from 'react-router-dom'

axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = "csrf_token";
axios.defaults.xsrfHeaderName = "x-csrf-token";
axios.defaults.withXSRFToken = true;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <RescueProvider>

    
    <App />
    </RescueProvider>
    </BrowserRouter>

  </StrictMode>,
)
