import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { IntlProvider } from "react-intl";
import enMessages from "./locales/en.json";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <IntlProvider locale="en" messages={enMessages}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <Toaster />
    </IntlProvider>
  </StrictMode>,
);
