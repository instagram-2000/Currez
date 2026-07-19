import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { DEFAULT_LANGUAGE, translations } from "../i18n/translations";

const STORAGE_KEY = "Currez-language";
const LanguageContext = createContext(null);

function readStoredLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && translations[stored] ? stored : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

function interpolate(template, vars) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in vars ? vars[key] : match,
  );
}

// Covers public/patient-facing pages only (company site, hospital landing
// page, booking + status pages) — the staff portals aren't translated yet,
// so this is intentionally not mounted around them. See translations.js.
export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(readStoredLanguage);

  const setLanguage = useCallback((code) => {
    if (!translations[code]) return;
    setLanguageState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // ignore (private browsing, storage disabled, etc.)
    }
  }, []);

  const t = useCallback(
    (key, vars) => {
      const template =
        translations[language]?.[key] ??
        translations[DEFAULT_LANGUAGE][key] ??
        key;
      return interpolate(template, vars);
    },
    [language],
  );

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context)
    throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
}
