'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Switch } from '@heroui/react';
import { Moon, Sun } from '@gravity-ui/icons';

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === 'dark';

  return (
    <Switch
      defaultSelected={isDark}
      size="lg"
      onChange={(newSelected: boolean) => {
        setTheme(newSelected ? 'dark' : 'light');
      }}
    >
      {({ isSelected }) => (
        <>
          <Switch.Control
            className={isSelected ? "bg-gray-700" : "bg-gray-200"}
          >
            <Switch.Thumb>
              <Switch.Icon>
                {isSelected ? (
                  <Moon className="size-3 text-gray-800 opacity-100" />
                ) : (
                  <Sun className="size-3 text-gray-800 opacity-100" />
                )}
              </Switch.Icon>
            </Switch.Thumb>
          </Switch.Control>
        </>
      )}
    </Switch>
  );
}