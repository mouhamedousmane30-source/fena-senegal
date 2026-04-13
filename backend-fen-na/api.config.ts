// src/services/api.config.ts

// On définit l'URL de base pour correspondre au port de ton Backend (5000)
export const API_BASE_URL = "http://localhost:5000/api";

export const REQUEST_TIMEOUT = 30000;

export const STORAGE_KEYS = {
  TOKEN: 'fena_token',
  REFRESH_TOKEN: 'fena_refresh_token',
  USER: 'fena_user'
};

export const DEFAULT_FETCH_OPTIONS: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
  },
};
