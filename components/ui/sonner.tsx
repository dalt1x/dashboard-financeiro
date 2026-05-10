"use client";

import { useEffect, useState } from "react";
import { Toaster as SonnerToaster, toast } from "sonner";
import {
  defaultTheme,
  readThemeFromDocument,
  themeChangeEvent,
  type ThemeMode,
} from "@/lib/theme";

export function Toaster(props: React.ComponentProps<typeof SonnerToaster>) {
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

  return <SonnerToaster theme={theme} {...props} />;
}

export { toast };
