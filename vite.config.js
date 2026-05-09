import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
  },

  optimizeDeps: {
    exclude: [],
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
    include: [
      'ethers',
      'react',
      'react-dom',
      'react-router-dom',
      'styled-components',
      '@zama-fhe/relayer-sdk/web',
    ],
  },

  // Tell Vite to recognise .wasm and .sol as static assets
  assetsInclude: ['**/*.sol', '**/*.wasm'],

  // FIX: Removed Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy headers.
  // COEP: require-corp blocks MetaMask's injected script from loading because
  // browser extension scripts don't carry the required CORP headers.
  // Result was window.ethereum = undefined → white screen + "MetaMask not found".
  // The SDK falls back to single-threaded WASM automatically without these headers,
  // which is fine for Sepolia testnet usage.
  server: {
    fs: {
      allow: ['..'],
    },
  },

  define: {
    global: 'globalThis',
  },

  resolve: {
    alias: {
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
      buffer: 'buffer',
    },
  },
})