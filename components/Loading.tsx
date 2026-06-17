"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Backdrop, CircularProgress, Fade } from "@mui/material";

type LoadingContextType = {
  showLoading: () => void;
  hideLoading: () => void;
};

const LoadingContext = createContext<LoadingContextType | null>(null);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const showLoading = () => setOpen(true);
  const hideLoading = () => setOpen(false);

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {children}

      <Fade in={open} unmountOnExit>
        <Backdrop
          open={open}
          sx={(theme) => ({
            zIndex: theme.zIndex.drawer + 999,
            backdropFilter: "blur(6px)",
            backgroundColor: "rgba(0,0,0,0.3)",
            color: theme.palette.primary.main,
          })}
        >
          <CircularProgress />
        </Backdrop>
      </Fade>
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within LoadingProvider");
  }
  return context;
}
