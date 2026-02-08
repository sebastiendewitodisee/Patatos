import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import { BUILD_INFO } from "./buildInfo";
import "./i18n";
import "./styles/global.css";
import "./styles/components.css";

console.log("PATATOS_BUILD_INFO", BUILD_INFO);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
);
