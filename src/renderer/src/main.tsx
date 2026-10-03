import './assets/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { PosProvider } from './state/pos'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <PosProvider>
      <App />
    </PosProvider>
  </React.StrictMode>
)
