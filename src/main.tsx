import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { SupabaseProvider } from "./contexts/SupabaseContext.tsx";
import { SessionProvider } from "./contexts/SessionContext.tsx";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <SupabaseProvider>
        <SessionProvider>
          <App />
        </SessionProvider>
      </SupabaseProvider>
    </LocalizationProvider>
  </StrictMode>
);
