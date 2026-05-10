"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  applyTheme,
  defaultTheme,
  readThemeFromDocument,
  themeChangeEvent,
  type ThemeMode,
} from "@/lib/theme";

export function ThemeToggle({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const [theme, setTheme] = useState<ThemeMode>(defaultTheme);

  useEffect(() => {
    const syncTheme = () => {
      setTheme(readThemeFromDocument());
    };

    syncTheme();
    window.addEventListener(themeChangeEvent, syncTheme);

    return () => {
      window.removeEventListener(themeChangeEvent, syncTheme);
    };
  }, []);

  const isDark = theme === "dark";

  return (
    <Button
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro roxo"}
      className={["gap-2", className].filter(Boolean).join(" ")}
      size={compact ? "icon" : "default"}
      type="button"
      variant="secondary"
      onClick={() => {
        const nextTheme: ThemeMode = isDark ? "light" : "dark";
        applyTheme(nextTheme);
        setTheme(nextTheme);
      }}
    >
      {isDark ? (
        <SunMedium className="h-4 w-4" />
      ) : (
        <MoonStar className="h-4 w-4" />
      )}
      {compact ? null : <span>{isDark ? "Tema claro" : "Tema escuro"}</span>}
    </Button>
  );
}
