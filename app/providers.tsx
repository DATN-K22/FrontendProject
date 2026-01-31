"use client";

import * as React from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { useServerInsertedHTML } from "next/navigation";

const theme = createTheme();

export default function Providers({ children }: { children: React.ReactNode }) {
  const [emotionCache] = React.useState(() => {
    const cache = createCache({ key: "mui" });
    cache.compat = true;
    return cache;
  });

  useServerInsertedHTML(() => {
    return (
      <style
        data-emotion={`${emotionCache.key} ${Object.keys(emotionCache.inserted).join(" ")}`}
        dangerouslySetInnerHTML={{
          __html: Object.values(emotionCache.inserted).join(" "),
        }}
      />
    );
  });

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}