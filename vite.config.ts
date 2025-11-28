import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: "/Fire_Detection_Website/",   // <-- Your repo name here
})
