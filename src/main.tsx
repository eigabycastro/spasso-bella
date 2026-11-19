import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Fontes hospedadas no próprio site (sem chamar o Google a cada visita — LGPD)
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/great-vibes/400.css'
import './styles/globals.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
