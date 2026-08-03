import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react-swc'

const fullReloadTargets = [
  '/src/components/',
  '/src/pages/',
  '/src/functions/',
]

const forceFullReloadForAdminFrontend = (): Plugin => ({
  name: 'force-full-reload-for-admin-frontend',
  apply: 'serve',
  handleHotUpdate({ file, server }) {
    const normalizedFile = file.replace(/\\/g, '/')
    const shouldReload = fullReloadTargets.some((target) =>
      normalizedFile.includes(target),
    )

    if (!shouldReload) return

    server.ws.send({ type: 'full-reload' })
    return []
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), forceFullReloadForAdminFrontend()],
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
