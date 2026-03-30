'use client';

import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as Theme;
      console.log('Initial theme from localStorage:', saved);
      return saved || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    console.log('Applying theme:', theme);
    
    // Remove both classes first
    root.classList.remove('dark', 'light');
    
    if (theme === 'dark') {
      root.classList.add('dark');
      console.log('Added dark class to root');
    } else {
      root.classList.add('light');
      console.log('Added light class to root');
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('Toggling theme from', theme, 'to', newTheme);
    setTheme(newTheme);
  };

  return { theme, toggleTheme };
}
