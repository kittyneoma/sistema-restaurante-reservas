import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // ------------------------------------------------------------------
    // Configuración del Proxy
    proxy: {
      // 1. Clave de coincidencia (Proxy Key): 
      //    Cualquier petición que comience con '/api' en tu frontend
      '/api': {
        // 2. Destino (Target): 
        //    Será redirigida a esta URL (tu backend en Node.js)
        target: 'http://localhost:5000',
        
        // 3. Cambiar origen (Change Origin): 
        //    Indica al servidor de destino que el origen de la petición
        //    ha cambiado (necesario para la mayoría de las APIs)
        changeOrigin: true, 
        
        // 4. Seguridad (Secure): 
        //    False en desarrollo, ya que no estamos usando HTTPS
        secure: false,      
      }
    }
    // ------------------------------------------------------------------
  }
})