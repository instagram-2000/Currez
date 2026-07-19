import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "Currez-theme";
const ThemeContext = createContext(null);

// Light is the app-wide default regardless of OS/browser preference — a
// visitor's first impression should match the brand, not whatever their
// system happens to be set to. Once someone picks a theme (via the toggle),
// that explicit choice is what's remembered.
function readStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // ignore (private browsing, storage disabled, etc.)
  }
  return "light";
}

// App-wide light/dark toggle. Applies a `.dark` class to <html> which every
// themed surface (bg-page, bg-surface, bg-card, text-heading, etc. — see
// index.css) reacts to, so this is the single source of truth for theme.
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readStoredTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
