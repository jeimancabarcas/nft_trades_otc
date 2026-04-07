import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'user-theme';
  
  // Signal to store the current dark mode state
  isDarkMode = signal<boolean>(this.getInitialTheme());

  constructor() {
    // Effect to apply the theme class to the document root whenever it changes
    effect(() => {
      const dark = this.isDarkMode();
      this.updateRender(dark);
      localStorage.setItem(this.THEME_KEY, dark ? 'dark' : 'light');
    });
  }

  toggleTheme() {
    this.isDarkMode.update(dark => !dark);
  }

  private getInitialTheme(): boolean {
    const saved = localStorage.getItem(this.THEME_KEY);
    if (saved) {
      return saved === 'dark';
    }
    // Default to system preference if no saved theme
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private updateRender(isDark: boolean) {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
