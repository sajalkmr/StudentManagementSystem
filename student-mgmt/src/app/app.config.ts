import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http'; // Import this
import { provideAnimations } from '@angular/platform-browser/animations'; // Optional: for UI/Charts

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Enables the app to talk to your C# Backend
    provideHttpClient(withFetch()), 
    // SSR Hydration (keep this as you have it)
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    // Useful if you use Angular Material or animations in your charts
    provideAnimations() 
  ]
};