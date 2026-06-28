import react from "@vitejs/plugin-react";
import { defineConfig, type PluginOption } from "vite";

function wasmMimePlugin(): PluginOption {
  return {
    name: "crucible-wasm-mime",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.url?.split("?")[0].endsWith(".wasm")) {
          response.setHeader("Content-Type", "application/wasm");
        }

        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.url?.split("?")[0].endsWith(".wasm")) {
          response.setHeader("Content-Type", "application/wasm");
        }

        next();
      });
    },
  };
}

export default defineConfig({
  assetsInclude: ["**/*.wasm"],
  plugins: [react(), wasmMimePlugin()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: process.env.CHOKIDAR_USEPOLLING === "true",
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    strictPort: true,
  },
});
