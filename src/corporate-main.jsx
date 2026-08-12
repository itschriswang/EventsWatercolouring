import React from 'react'
import ReactDOM from 'react-dom/client'
import CorporatePage from './pages/CorporatePage.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <CorporatePage />
    </ErrorBoundary>
  </React.StrictMode>,
)
