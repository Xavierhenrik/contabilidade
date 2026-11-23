import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/barlow-semi-condensed/latin-400.css";
import "@fontsource/barlow-semi-condensed/latin-ext-400.css";
import "@fontsource/barlow-semi-condensed/latin-600.css";
import "@fontsource/barlow-semi-condensed/latin-ext-600.css";
import "@fontsource/barlow-semi-condensed/latin-700.css";
import "@fontsource/barlow-semi-condensed/latin-ext-700.css";
import "@fontsource/courier-prime/latin-400.css";
import "@fontsource/courier-prime/latin-ext-400.css";
import "@fontsource/courier-prime/latin-700.css";
import "@fontsource/courier-prime/latin-ext-700.css";
import "./styles.css";
import { App } from "./App.jsx";

createRoot(document.getElementById("root")).render(<App />);
