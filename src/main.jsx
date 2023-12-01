import React from "react";
import ReactDOM from "react-dom/client";
import Busmap from "./components/map.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import store from "./components/store/index.js";
import { Provider } from "react-redux";
import App from "./components/App.jsx";
ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);
