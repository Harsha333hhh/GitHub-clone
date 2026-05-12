import { create } from 'zustand';

const THEME_STORAGE_KEY = 'devhub-theme';
const FONT_STORAGE_KEY = 'devhub-font';
const THEMES = ['dark', 'light', 'green', 'orange', 'yellow', 'blue'];
const FONTS = [
  {
    label: 'Inter',
    value: 'inter',
    css: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  },
  {
    label: 'Lucida Sans',
    value: 'lucida-sans',
    css: '"Lucida Sans Unicode", "Lucida Grande", "Lucida Sans", Arial, sans-serif',
  },
  {
    label: 'Lucida Bright',
    value: 'lucida-bright',
    css: '"Lucida Bright", Georgia, serif',
  },
  {
    label: 'Calligraphy',
    value: 'calligraphy',
    css: '"Great Vibes", "Apple Chancery", "Brush Script MT", "Segoe Script", cursive',
  },
];

const applyThemeToDocument = (theme) => {
  const nextTheme = THEMES.includes(theme) ? theme : 'dark';
  document.documentElement.setAttribute('data-theme', nextTheme);
  document.body.setAttribute('data-theme', nextTheme);
  document.documentElement.style.colorScheme = nextTheme === 'dark' ? 'dark' : 'light';
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
};

const applyFontToDocument = (font) => {
  const nextFont = FONTS.find(item => item.value === font) || FONTS[0];
  document.documentElement.setAttribute('data-font', nextFont.value);
  document.body.setAttribute('data-font', nextFont.value);
  document.documentElement.style.setProperty('--app-font', nextFont.css);
  document.documentElement.style.fontFamily = nextFont.css;
  document.body.style.fontFamily = nextFont.css;
  localStorage.setItem(FONT_STORAGE_KEY, nextFont.value);
};

const getInitialTheme = () => {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  return THEMES.includes(storedTheme) ? storedTheme : 'dark';
};

const getInitialFont = () => {
  const storedFont = localStorage.getItem(FONT_STORAGE_KEY);
  return FONTS.some(item => item.value === storedFont) ? storedFont : 'inter';
};

export const useThemeStore = create((set, get) => ({
  theme: getInitialTheme(),
  font: getInitialFont(),
  themes: THEMES,
  fonts: FONTS,

  initializeTheme: () => {
    applyThemeToDocument(get().theme);
    applyFontToDocument(get().font);
  },

  setTheme: (theme) => {
    const nextTheme = THEMES.includes(theme) ? theme : 'dark';
    applyThemeToDocument(nextTheme);
    set({ theme: nextTheme });
  },

  setFont: (font) => {
    const nextFont = FONTS.some(item => item.value === font) ? font : 'inter';
    applyFontToDocument(nextFont);
    set({ font: nextFont });
  },
}));

export { THEMES, FONTS, applyThemeToDocument, applyFontToDocument, getInitialTheme, getInitialFont };
