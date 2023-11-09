import React from 'react'
import ReactDOM from 'react-dom/client'
import Busmap from './components/map.jsx'
import './index.css'
import { BrowserRouter,HashRouter} from "react-router-dom";
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 配合gh-pages進行設定 */}
    {/* basename="/TaichungBusAPP" */}
    <HashRouter basename="/">
        <Busmap />  
    </HashRouter>
  </React.StrictMode>,
)
