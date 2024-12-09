import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: {
      disableDotRule: true
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  }
});
