import React from 'react'
import ReactDOM from 'react-dom/client'
import FaqPage from './pages/FaqPage.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <FaqPage />
    </ErrorBoundary>
  </React.StrictMode>,
)
