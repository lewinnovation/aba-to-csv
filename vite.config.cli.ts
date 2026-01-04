import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'cli.ts',
      formats: ['es'],
      fileName: 'cli',
    },
    rollupOptions: {
      external: ['fs', 'path'],
    },
    outDir: 'dist-cli',
    emptyOutDir: true,
  },
})
