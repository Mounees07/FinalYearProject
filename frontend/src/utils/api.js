import axios from 'axios';
import { auth } from '../firebase/firebase';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
});

// Interceptor to add Firebase ID Token to every request
api.interceptors.request.use(async (config) => {
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken(true); // Force refresh token
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Add cache-busting headers to ensure fresh data
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers['Pragma'] = 'no-cache';
    config.headers['Expires'] = '0';
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
