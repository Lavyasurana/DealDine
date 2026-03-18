import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'
import RescueProvider from './context/rescueContext.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <RescueProvider>

    
    <App />
    </RescueProvider>
    </BrowserRouter>

  </StrictMode>,
)
