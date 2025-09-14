 // vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    // Optional: Configure base URL if deployed to a subpath
    // base: '/my-app/', 
    build: {
    outDir: 'build', // Matches CRA's default build folder
    },
});