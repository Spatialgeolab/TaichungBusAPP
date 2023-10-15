import React from 'react'
import ReactDOM from 'react-dom/client'
import Busmap from './components/map.jsx'
import './index.css'
import { BrowserRouter,Routes} from "react-router-dom";
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
        <Busmap />  
    </BrowserRouter>
  </React.StrictMode>,
)
