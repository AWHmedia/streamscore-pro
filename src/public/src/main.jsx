jsximport React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ControlPanel from './ControlPanel'
import Overlay from './Overlay'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<ControlPanel />} />
      <Route path="/overlay" element={<Overlay />} />
    </Routes>
  </BrowserRouter>
)
