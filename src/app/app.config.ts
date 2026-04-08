import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import Material from '@primeuix/themes/material';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { environment } from '../environments/environment';

// Initialize Firebase as a singleton instance
const firebaseApp = initializeApp(environment.firebase);
const database = getDatabase(firebaseApp);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimations(),
    MessageService,
    // Custom provider for Firebase Database to make it injectable via inject()
    { provide: 'FIREBASE_DB', useValue: database },
    providePrimeNG({
      theme: {
        preset: Material,
        options: {
          prefix: 'p',
          darkModeSelector: '.dark-none',
          cssLayer: false
        }
      }
    })
  ]
};
