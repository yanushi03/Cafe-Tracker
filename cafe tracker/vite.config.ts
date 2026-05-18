import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        plugins: [react()],
        server: {
            proxy: {
                '/foursquare': {
                    target: 'https://places-api.foursquare.com',
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/foursquare/, ''),
                    configure: (proxy) => {
                        proxy.on('proxyReq', (proxyReq) => {
                            console.log('API KEY:', env.VITE_FOURSQUARE_API_KEY);
                            proxyReq.setHeader('Authorization', `Bearer ${env.VITE_FOURSQUARE_API_KEY}`);
                        });
                    }
                }
            }
        }
    }
})