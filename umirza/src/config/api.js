const fallbackUrl = 'https://my-spotify-player-tm8k.onrender.com';
const envBaseUrl = process.env.VUE_APP_API_BASE_URL;

export const API_BASE_URL = (envBaseUrl || fallbackUrl).replace(/\/+$/, '');
