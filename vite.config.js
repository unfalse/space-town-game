import { defineConfig } from 'vite';
import { resolve } from 'path';
import { createHtmlPlugin } from 'vite-plugin-html';
import vitePluginCopy from 'rollup-plugin-copy';

export default defineConfig({
  plugins: [
    createHtmlPlugin({
      template: 'src/index.html',
    }),
    vitePluginCopy({
      targets: [
        { src: 'assets/**/*', dest: 'dist/assets' },
        { src: 'src/styles/**/*', dest: 'dist/styles' },
      ],
      hook: 'writeBundle',
    }),
  ],
  resolve: {
    extensions: ['.ts', '.js'],
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.ts'),
      },
      output: {
        entryFileNames: 'space-town-bundle.js',
      },
    },
  },
  server: {
    port: 3666,
    open: true,
  },
});