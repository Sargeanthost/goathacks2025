import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SupabaseProvider } from './contexts/SupabaseContext.tsx'
import { SessionProvider } from './contexts/SessionContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SupabaseProvider>
      <SessionProvider>
        <App />
      </SessionProvider>
    </SupabaseProvider>
  </StrictMode>,
)
