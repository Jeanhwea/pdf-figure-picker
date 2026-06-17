import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './app/app'
import { ThemeProvider } from './components/theme-provider'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="pdf-figure-picker-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>
)
