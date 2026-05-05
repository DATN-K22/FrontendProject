"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Snackbar, Alert, AlertColor, SnackbarOrigin } from "@mui/material";

type AlertContextType = {
  showAlert: (
    message: string,
    severity?: AlertColor,
    position?: SnackbarOrigin,
  ) => void;
};

const AlertContext = createContext<AlertContextType | null>(null);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertColor>("info");
  const [position, setPosition] = useState<SnackbarOrigin>({
    vertical: "bottom",
    horizontal: "left",
  });

  const showAlert = (
    msg: string,
    sev: AlertColor = "info",
    position: SnackbarOrigin = {
      vertical: "bottom",
      horizontal: "left",
    },
  ) => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
    setPosition(position);
  };

  const handleClose = () => setOpen(false);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}

      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{
          vertical: position.vertical,
          horizontal: position.horizontal,
        }}
      >
        <Alert
          severity={severity}
          variant="filled"
          onClose={handleClose}
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within AlertProvider");
  }
  return context;
}
