import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { Buffer } from 'buffer';

// Polyfill global Buffer for Seaport and ether libraries
(window as any).Buffer = Buffer;

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
