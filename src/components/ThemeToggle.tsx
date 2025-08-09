import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/ThemeProvider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  const getIcon = () => {
    if (theme === "dark") {
      return <img src="/icons/moon.svg" className="h-4 w-4 dark:filter dark:brightness-0 dark:invert" alt="Dark Mode" />
    } else if (theme === "light") {
      return <img src="/icons/sun.svg" className="h-4 w-4 dark:filter dark:brightness-0 dark:invert" alt="Light Mode" />
    } else {
      // System theme - show based on actual applied theme
      const isDark = document.documentElement.classList.contains("dark")
      return isDark ? 
        <img src="/icons/moon.svg" className="h-4 w-4 dark:filter dark:brightness-0 dark:invert" alt="Dark Mode" /> : 
        <img src="/icons/sun.svg" className="h-4 w-4 dark:filter dark:brightness-0 dark:invert" alt="Light Mode" />
    }
  }

  const getLabel = () => {
    if (theme === "dark") return "Dark"
    if (theme === "light") return "Light"
    return "Auto"
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={toggleTheme}
      className="flex items-center gap-2 hover:bg-muted/50"
      title={`Current theme: ${getLabel()}. Click to cycle through themes.`}
    >
      {getIcon()}
      <span className="hidden sm:inline">{getLabel()}</span>
    </Button>
  )
}

export function MobileThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  const getIcon = () => {
    if (theme === "dark") {
      return <img src="/icons/moon.svg" className="h-5 w-5 dark:filter dark:brightness-0 dark:invert" alt="Dark Mode" />
    } else if (theme === "light") {
      return <img src="/icons/sun.svg" className="h-5 w-5 dark:filter dark:brightness-0 dark:invert" alt="Light Mode" />
    } else {
      // System theme - show based on actual applied theme
      const isDark = document.documentElement.classList.contains("dark")
      return isDark ? 
        <img src="/icons/moon.svg" className="h-5 w-5 dark:filter dark:brightness-0 dark:invert" alt="Dark Mode" /> : 
        <img src="/icons/sun.svg" className="h-5 w-5 dark:filter dark:brightness-0 dark:invert" alt="Light Mode" />
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={toggleTheme}
      className="flex items-center justify-center p-2 h-10 w-10 rounded-full hover:bg-muted/50"
      title="Toggle theme"
    >
      {getIcon()}
    </Button>
  )
}