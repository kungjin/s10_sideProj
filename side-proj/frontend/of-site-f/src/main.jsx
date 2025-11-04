import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/tailwind.css";
import RoutesConfig from "./RoutesConfig.jsx"; 

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <RoutesConfig />
    </BrowserRouter>
  </React.StrictMode>
);




