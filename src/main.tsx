import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

/** Apply the persisted theme before React paints to avoid a flash. */
function bootstrapTheme() {
  try {
    const raw = localStorage.getItem('edusense-app-v1')
    if (!raw) return
    const parsed = JSON.parse(raw) as { state?: { theme?: string } }
    if (parsed?.state?.theme === 'dark') {
      document.documentElement.classList.add('dark')
    }
  } catch {
    /* ignore malformed storage */
  }
}

bootstrapTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
