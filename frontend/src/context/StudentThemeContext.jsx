import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const StudentThemeContext = createContext();

export const themes = {
  game_dev: {
    name: 'Neon Void',
    id: 'game_dev',
    colors: {
      primary: '#00D1FF', // Neon Blue
      secondary: '#9D00FF', // Purple
      accent: '#00FFC2', // Cyan
      background: '#051424',
      surface: '#0d1c2d',
      text: '#FFFFFF',
      muted: '#8F9BB3',
      border: 'rgba(255, 255, 255, 0.05)',
      glow: 'rgba(0, 209, 255, 0.3)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #00D1FF 0%, #9D00FF 100%)',
      surface: 'linear-gradient(180deg, rgba(13, 28, 45, 0.8) 0%, rgba(5, 20, 36, 0.9) 100%)',
    }
  },
  blockchain: {
    name: 'Cyber Ether',
    id: 'blockchain',
    colors: {
      primary: '#00FF94', // Emerald
      secondary: '#FFD700', // Gold
      accent: '#00A3FF', // Electric Blue
      background: '#051424',
      surface: '#0d1c2d',
      text: '#FFFFFF',
      muted: '#7A828E',
      border: 'rgba(255, 255, 255, 0.05)',
      glow: 'rgba(0, 255, 148, 0.2)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #00FF94 0%, #00A3FF 100%)',
      surface: 'linear-gradient(180deg, rgba(13, 28, 45, 0.8) 0%, rgba(10, 11, 13, 0.9) 100%)',
    }
  },
  agnostic: {
    name: 'Pixora Core',
    id: 'agnostic',
    colors: {
      primary: '#c3f400', // Pixora Lime
      secondary: '#ffffff',
      accent: '#c3f400',
      background: '#051424',
      surface: '#0d1c2d',
      text: '#FFFFFF',
      muted: '#8F9BB3',
      border: 'rgba(255, 255, 255, 0.05)',
      glow: 'rgba(195, 244, 0, 0.15)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #c3f400 0%, #9bc400 100%)',
      surface: 'linear-gradient(180deg, rgba(13, 28, 45, 0.8) 0%, rgba(5, 20, 36, 0.9) 100%)',
    }
  }
};

export const StudentThemeProvider = ({ children }) => {
  const { profile } = useAuth();
  const [currentTheme, setCurrentTheme] = useState(themes.agnostic);

  useEffect(() => {
    if (profile?.learning_track && themes[profile.learning_track]) {
      setCurrentTheme(themes[profile.learning_track]);
    } else {
      setCurrentTheme(themes.agnostic);
    }
  }, [profile]);

  // Apply theme variables to root
  useEffect(() => {
    const root = document.documentElement;
    const { colors, gradients } = currentTheme;

    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--st-color-${key}`, value);
    });

    Object.entries(gradients).forEach(([key, value]) => {
      root.style.setProperty(`--st-gradient-${key}`, value);
    });

    root.style.setProperty('--st-theme-id', currentTheme.id);
  }, [currentTheme]);

  const setTheme = (themeId) => {
    if (themes[themeId]) {
      setCurrentTheme(themes[themeId]);
    }
  };

  return (
    <StudentThemeContext.Provider value={{ currentTheme, themes, setTheme }}>
      <div className={`student-theme-${currentTheme.id} min-h-screen bg-[var(--st-color-background)] text-[var(--st-color-text)]`}>
        {children}
      </div>
    </StudentThemeContext.Provider>
  );
};

export const useStudentTheme = () => useContext(StudentThemeContext);
