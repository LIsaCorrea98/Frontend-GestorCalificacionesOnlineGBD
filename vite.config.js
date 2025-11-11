import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración de Vite
export default defineConfig({
  plugins: [react()],
  base: '/', // Esto asegura que todas las rutas funcionen correctamente
});
