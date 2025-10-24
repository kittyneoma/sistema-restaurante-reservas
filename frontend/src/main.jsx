import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// ----------------------------------------------------
import { BrowserRouter } from 'react-router-dom'; // <-- ¡Importar Router!
// ----------------------------------------------------
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* ¡ENVOLVER EL COMPONENTE APP CON EL ROUTER! */}
    <BrowserRouter> 
      <App />
    </BrowserRouter>
  </StrictMode>,
)