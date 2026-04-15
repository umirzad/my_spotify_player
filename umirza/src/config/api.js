const fallbackUrl = 'https://my-spotify-player-tm8k.onrender.com';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || fallbackUrl).replace(/\/+$/, '');
