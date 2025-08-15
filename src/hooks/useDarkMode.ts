import { useState, useEffect } from 'react';

export function useDarkMode(): boolean {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const matcher = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(matcher.matches);

    const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
    matcher.addEventListener('change', listener);

    return () => matcher.removeEventListener('change', listener);
  }, []);

  return isDark;
}
