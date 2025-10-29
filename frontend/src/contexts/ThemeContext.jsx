import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first, then system preference
    const stored = localStorage.getItem('theme');
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored;
    }
    return 'system';
  });

  const [systemTheme, setSystemTheme] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Determine effective theme
    const effectiveTheme = theme === 'system' ? systemTheme : theme;
    
    // Add theme class
    root.classList.add(effectiveTheme);
    
    // Store in localStorage (but not 'system' resolved to actual theme)
    localStorage.setItem('theme', theme);
  }, [theme, systemTheme]);

  const setThemeMode = (newTheme) => {
    if (['light', 'dark', 'system'].includes(newTheme)) {
      setTheme(newTheme);
    }
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getEffectiveTheme = () => {
    return theme === 'system' ? systemTheme : theme;
  };

  const isDark = () => {
    return getEffectiveTheme() === 'dark';
  };

  const isLight = () => {
    return getEffectiveTheme() === 'light';
  };

  const value = {
    theme,
    systemTheme,
    effectiveTheme: getEffectiveTheme(),
    setTheme: setThemeMode,
    toggleTheme,
    isDark,
    isLight,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};