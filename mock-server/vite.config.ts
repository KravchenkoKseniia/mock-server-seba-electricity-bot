import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/register': 'http://localhost:8080',
            '/login': 'http://localhost:8080',
            '/device': 'http://localhost:8080'
        }
    }
})
