import React from 'react'
import ReactDOM from 'react-dom/client'
import Busmap from './components/map.jsx'
import './index.css'
import { BrowserRouter} from "react-router-dom";
import store from './components/store/index.js';
import { Provider } from "react-redux";
ReactDOM.createRoot(document.getElementById('root')).render(
    <Provider store={store} >
        <BrowserRouter>
            <Busmap />  
        </BrowserRouter>
    </Provider>
)
