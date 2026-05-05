"use client";

import DOMPurify from "isomorphic-dompurify";
import { Box } from "@mui/material";

type Props = {
  html: string;
};

export default function SafeHtml({ html }: Props) {
  const clean = DOMPurify.sanitize(html);

  return (
    <Box
      sx={{
        lineHeight: 1.7,
        "& h1": { fontSize: "2rem", fontWeight: 700, mt: 2 },
        "& h2": { fontSize: "1.5rem", fontWeight: 700, mt: 2 },
        "& h3": { fontSize: "1.25rem", fontWeight: 700, mt: 2 },
        "& p": { mb: 1 },
        "& ul": { pl: 3, mb: 1 },
        "& li": { mb: 0.5 },
        "& strong": { fontWeight: 700 },
        "& code": {
          bgcolor: "#f5f5f5",
          px: 0.5,
          py: 0.2,
          borderRadius: 1,
          fontFamily: "monospace",
        },
        "& pre": {
          bgcolor: "#111",
          color: "#fff",
          p: 2,
          borderRadius: 2,
          overflow: "auto",
        },
        "& img": {
          maxWidth: "100%",
          borderRadius: 2,
          my: 1,
        },
      }}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
