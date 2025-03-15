import { Button, Box } from '@mui/material';
import { themes } from './themes';
import { useThemeStore } from './useThemeStore';

const ThemeSwitcher = () => {
  const { currentTheme, setTheme } = useThemeStore();
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
      {Object.keys(themes).map((themeKey) => (
        <Button
          key={themeKey}
          variant={currentTheme === themeKey ? 'contained' : 'outlined'}
          onClick={() =>
            setTheme(themeKey as 'light' | 'dark' | 'nord' | 'github')
          }
        >
          {themeKey}
        </Button>
      ))}
    </Box>
  );
};

export default ThemeSwitcher;
