import React from "react";
import { createRoot } from "react-dom/client";
import App from "./legacy/App.tsx";
import "./legacy/index.css";
import "./home.css";
import "./site.css";
import "./theme.css";
import "./pages.css";
import "./hero-motion.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
