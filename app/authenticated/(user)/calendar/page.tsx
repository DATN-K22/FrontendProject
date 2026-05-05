"use client";

import { useEffect, useRef } from "react";
import calendarjs from "@calendarjs/ce";

export default function CalendarView() {
  const calendarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!calendarRef.current) return;

    calendarRef.current.innerHTML = "";
    calendarjs.Calendar(calendarRef.current, {
      type: "inline",
      value: "2026-03-20",
      onchange: (_self: unknown, value: string) => {
        console.log("Selected date:", value);
      },
    });
  }, []);

  return (
    <div
      ref={calendarRef}
      style={{ minHeight: "360px", backgroundColor: "#fff", padding: "8px" }}
    />
  );
}