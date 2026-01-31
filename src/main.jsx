import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { IntlProvider } from "react-intl";
import enMessages from "./locales/en.json";
import ToastProvider from "./components/ToastProvider";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <IntlProvider locale="en" messages={enMessages}>
      <BrowserRouter>
        <SnackbarProvider>
          <App />
          <ToastProvider />
        </SnackbarProvider>
      </BrowserRouter>
    </IntlProvider>
  </StrictMode>,
);
