"use client"

import { useTheme } from "@/components/theme-provider"
import { Moon, Sun } from "lucide-react"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center space-x-2">
      <Sun className="h-5 w-5 text-muted-foreground" />
      <button
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        style={{
          backgroundColor: theme === "light" ? "#e5e7eb" : "#6366f1",
        }}
      >
        <span
          className={`${
            theme === "light" ? "translate-x-1" : "translate-x-6"
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
      </button>
      <Moon className="h-5 w-5 text-muted-foreground" />
    </div>
  )
}

