import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        app: 'index.html',
        home: 'src/pages/home/index.html',
        escuelasRegistradas: 'src/pages/escuelas-registradas/index.html',
        instituciones: 'src/pages/instituciones/index.html',
        administradores: 'src/pages/administradores/index.html',
        usuarios: 'src/pages/usuarios/index.html',
        padres: 'src/pages/padres/index.html',
        estudiantes: 'src/pages/estudiantes/index.html',
      }
    }
  }
})
