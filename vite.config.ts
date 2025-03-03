import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  root: '.',  // Ensure Vite looks for index.html in the correct place
  plugins: [react()],
  build: {
    outDir: 'dist', // Output directory for production build
    emptyOutDir: true, // Clears the output directory before building
  },
})
