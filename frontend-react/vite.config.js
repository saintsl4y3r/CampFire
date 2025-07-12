import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Để dùng @/components, @/pages,...
    },
  },
  server: {
    port: 3000, // Tuỳ chỉnh cổng nếu cần
  },
});