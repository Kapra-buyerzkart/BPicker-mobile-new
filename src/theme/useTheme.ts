import { useContext } from 'react';
import { ThemeContext } from './ThemeProvider';
import type { ThemeContextValue } from './ThemeProvider';

/**
 * Access the active theme.
 *
 * @returns `{ mode, theme, colors, isDark, toggleTheme, setMode }`
 */
export const useTheme = (): ThemeContextValue => useContext(ThemeContext);

export default useTheme;
