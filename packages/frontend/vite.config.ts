import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // VitePWA({
    //   strategies: 'injectManifest',
    //   srcDir: 'src/application',
    //   filename: 'worker.js',
    //   manifest: manifest as Partial<ManifestOptions>,
    //   devOptions: { enabled: true },
    //   injectRegister: 'script',
    // })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
