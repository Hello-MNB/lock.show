import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './features/auth/AuthProvider.jsx'
import { OrgProvider } from './context/OrgContext.jsx'
import { LangProvider } from './context/LangContext.jsx'
import { ToastProvider } from './components/ui.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { captureFirstTouch } from './lib/analytics.js'
import './index.css'

// Deep-link restore (§7.6): a dynamic route (/app/passport/:id …) opened fresh
// on the static site host has no physical file, so the site's 404 bootstrap
// bounces it here as /app/?dl=<original-path>. Restore it BEFORE the router
// reads location. Same-origin paths only — a value not starting with a single
// '/' (or starting '//', a protocol-relative URL) is discarded.
{
  const dl = new URLSearchParams(window.location.search).get('dl')
  if (dl && /^\/(?!\/)/.test(dl)) window.history.replaceState(null, '', dl)
}

// First-touch attribution (audit T-55) — capture utm_*/referrer/landing ONCE
// per browser, BEFORE the router strips the query. Attached to
// signup_completed (Signup.jsx) so acquisition is attributable first-party.
captureFirstTouch()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* BASE_URL: '/' standalone · '/app/' when embedded in the public website */}
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <ErrorBoundary>
        <LangProvider>
          <AuthProvider>
            <OrgProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </OrgProvider>
          </AuthProvider>
        </LangProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
)
