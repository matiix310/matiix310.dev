"use client";

import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";

export default function ThemeSwitcher() {
  const { setTheme, systemTheme, theme } = useTheme();

  const getCurrentTheme = () => {
    return theme === "system" ? systemTheme : theme;
  };

  const switchTheme = () =>
    getCurrentTheme() === "dark" ? setTheme("light") : setTheme("dark");

  return (
    <Button variant="ghost" className="w-fit hover:cursor-pointer" onClick={switchTheme}>
      {getCurrentTheme() === "light" ? <Sun /> : <Moon />}
    </Button>
  );
}
