"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { Locale, localeNames } from "@/lib/i18n";

interface LocaleContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: "en",
  setLocale: () => {},
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");
  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

// Language Switcher component
export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 bg-secondary/50 border border-border px-3 py-1.5 rounded-full text-xs font-medium hover:bg-secondary transition-colors"
      >
        <span className="text-base leading-none">🌐</span>
        <span>{localeNames[locale]}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 bg-secondary border border-border rounded-lg shadow-xl overflow-hidden z-50 min-w-[140px]">
          {(Object.keys(localeNames) as Locale[]).map((l) => (
            <button
              key={l}
              onClick={() => { setLocale(l); setOpen(false); }}
              className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-primary/10 transition-colors ${
                locale === l ? "text-primary font-semibold bg-primary/5" : "text-foreground"
              }`}
            >
              {localeNames[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
