import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// A painter's mark for anyone curious enough to open the console.
console.info(
  '%c🖌 painted by hand — chriswangstudio.com',
  'color:#66681C;font-size:12px;font-family:Georgia,serif;',
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
