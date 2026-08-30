import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const apiKey = env.GEMINI_API_KEY || env.API_KEY || '';

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        allowedHosts: true,
        cors: true,
        proxy: {
          '/api': 'http://127.0.0.1:8787',
          '/webhook': 'http://127.0.0.1:8787',
          '/admin': 'http://127.0.0.1:8787',
          '/health': 'http://127.0.0.1:8787',
        },
      },
      preview: {
        port: 3000,
        host: '0.0.0.0',
        allowedHosts: true,
        proxy: {
          '/api': 'http://127.0.0.1:8787',
          '/webhook': 'http://127.0.0.1:8787',
          '/admin': 'http://127.0.0.1:8787',
          '/health': 'http://127.0.0.1:8787',
        },
      },
      plugins: [],
      define: {
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
