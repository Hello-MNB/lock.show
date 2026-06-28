import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './features/auth/AuthProvider.jsx'
import { OrgProvider } from './context/OrgContext.jsx'
import { LangProvider } from './context/LangContext.jsx'
import { ToastProvider } from './components/ui.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LangProvider>
        <AuthProvider>
          <OrgProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </OrgProvider>
        </AuthProvider>
      </LangProvider>
    </BrowserRouter>
  </React.StrictMode>
)
