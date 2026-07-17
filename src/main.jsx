import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import AuthProvider from './context/AuthProvider.jsx'
import FavoritesProvider from './context/FavoritesProvider.jsx'
import ThemeProvider from './context/ThemeProvider.jsx'
import ToastProvider from './context/ToastProvider.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <FavoritesProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </FavoritesProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
