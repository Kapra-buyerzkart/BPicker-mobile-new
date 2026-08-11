import { useContext } from 'react';
import { ThemeContext } from './ThemeProvider';
import type { ThemeContextValue } from './ThemeProvider';

export const useTheme = (): ThemeContextValue => useContext(ThemeContext);

export default useTheme;
