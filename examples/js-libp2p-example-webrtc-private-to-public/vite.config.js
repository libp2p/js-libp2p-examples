export default {
  server: {
    port: 3000,
    open: true
  },
  build: {
    target: 'es2022'
  },
  optimizeDeps: {
    esbuildOptions: { target: 'es2022', supported: { bigint: true } }
  }
}
