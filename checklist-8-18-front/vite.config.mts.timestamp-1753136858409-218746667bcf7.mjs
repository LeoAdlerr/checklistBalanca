// vite.config.mts
import AutoImport from "file:///C:/git/checklistBalanca/checklist-balanca-front/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///C:/git/checklistBalanca/checklist-balanca-front/node_modules/unplugin-vue-components/dist/vite.js";
import Fonts from "file:///C:/git/checklistBalanca/checklist-balanca-front/node_modules/unplugin-fonts/dist/vite.mjs";
import Layouts from "file:///C:/git/checklistBalanca/checklist-balanca-front/node_modules/vite-plugin-vue-layouts-next/dist/index.mjs";
import Vue from "file:///C:/git/checklistBalanca/checklist-balanca-front/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import VueRouter from "file:///C:/git/checklistBalanca/checklist-balanca-front/node_modules/unplugin-vue-router/dist/vite.js";
import { VueRouterAutoImports } from "file:///C:/git/checklistBalanca/checklist-balanca-front/node_modules/unplugin-vue-router/dist/index.js";
import Vuetify, { transformAssetUrls } from "file:///C:/git/checklistBalanca/checklist-balanca-front/node_modules/vite-plugin-vuetify/dist/index.mjs";
import { defineConfig } from "file:///C:/git/checklistBalanca/checklist-balanca-front/node_modules/vite/dist/node/index.js";
import { fileURLToPath, URL } from "node:url";
import { configDefaults } from "file:///C:/git/checklistBalanca/checklist-balanca-front/node_modules/vitest/dist/config.js";
var __vite_injected_original_import_meta_url = "file:///C:/git/checklistBalanca/checklist-balanca-front/vite.config.mts";
var vite_config_default = defineConfig({
  plugins: [
    VueRouter({
      dts: "src/typed-router.d.ts"
    }),
    Layouts(),
    AutoImport({
      imports: [
        "vue",
        VueRouterAutoImports,
        {
          pinia: ["defineStore", "storeToRefs"]
        }
      ],
      dts: "src/auto-imports.d.ts",
      eslintrc: {
        enabled: true
      },
      vueTemplate: true
    }),
    Components({
      dts: "src/components.d.ts"
    }),
    Vue({
      template: { transformAssetUrls }
    }),
    Vuetify({
      autoImport: true,
      styles: {
        configFile: "src/styles/settings.scss"
      }
    }),
    Fonts({
      fontsource: {
        families: [
          {
            name: "Roboto",
            weights: [100, 300, 400, 500, 700, 900],
            styles: ["normal", "italic"]
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    exclude: [
      "vuetify",
      "vue-router",
      "unplugin-vue-router/runtime",
      "unplugin-vue-router/data-loaders",
      "unplugin-vue-router/data-loaders/basic"
    ]
  },
  define: { "process.env": {} },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("src", __vite_injected_original_import_meta_url))
    },
    extensions: [
      ".js",
      ".json",
      ".jsx",
      ".mjs",
      ".ts",
      ".tsx",
      ".vue"
    ]
  },
  server: {
    port: 3e3
  },
  css: {
    preprocessorOptions: {
      sass: {
        api: "modern-compiler"
      },
      scss: {
        api: "modern-compiler"
      }
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    deps: {
      inline: ["vuetify"]
    },
    exclude: [
      ...configDefaults.exclude,
      "e2e/**"
    ]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcZ2l0XFxcXGNoZWNrbGlzdEJhbGFuY2FcXFxcY2hlY2tsaXN0LWJhbGFuY2EtZnJvbnRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXGdpdFxcXFxjaGVja2xpc3RCYWxhbmNhXFxcXGNoZWNrbGlzdC1iYWxhbmNhLWZyb250XFxcXHZpdGUuY29uZmlnLm10c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovZ2l0L2NoZWNrbGlzdEJhbGFuY2EvY2hlY2tsaXN0LWJhbGFuY2EtZnJvbnQvdml0ZS5jb25maWcubXRzXCI7Ly8vIDxyZWZlcmVuY2UgdHlwZXM9XCJ2aXRlc3RcIiAvPlxuXG4vLyBQbHVnaW5zXG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tICd1bnBsdWdpbi1hdXRvLWltcG9ydC92aXRlJ1xuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSdcbmltcG9ydCBGb250cyBmcm9tICd1bnBsdWdpbi1mb250cy92aXRlJ1xuaW1wb3J0IExheW91dHMgZnJvbSAndml0ZS1wbHVnaW4tdnVlLWxheW91dHMtbmV4dCdcbmltcG9ydCBWdWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuaW1wb3J0IFZ1ZVJvdXRlciBmcm9tICd1bnBsdWdpbi12dWUtcm91dGVyL3ZpdGUnXG5pbXBvcnQgeyBWdWVSb3V0ZXJBdXRvSW1wb3J0cyB9IGZyb20gJ3VucGx1Z2luLXZ1ZS1yb3V0ZXInXG5pbXBvcnQgVnVldGlmeSwgeyB0cmFuc2Zvcm1Bc3NldFVybHMgfSBmcm9tICd2aXRlLXBsdWdpbi12dWV0aWZ5J1xuXG4vLyBVdGlsaXRpZXNcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBVUkwgfSBmcm9tICdub2RlOnVybCdcbmltcG9ydCB7IGNvbmZpZ0RlZmF1bHRzIH0gZnJvbSAndml0ZXN0L2NvbmZpZydcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICBWdWVSb3V0ZXIoe1xuICAgICAgZHRzOiAnc3JjL3R5cGVkLXJvdXRlci5kLnRzJyxcbiAgICB9KSxcbiAgICBMYXlvdXRzKCksXG4gICAgQXV0b0ltcG9ydCh7XG4gICAgICBpbXBvcnRzOiBbXG4gICAgICAgICd2dWUnLFxuICAgICAgICBWdWVSb3V0ZXJBdXRvSW1wb3J0cyxcbiAgICAgICAge1xuICAgICAgICAgIHBpbmlhOiBbJ2RlZmluZVN0b3JlJywgJ3N0b3JlVG9SZWZzJ10sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgZHRzOiAnc3JjL2F1dG8taW1wb3J0cy5kLnRzJyxcbiAgICAgIGVzbGludHJjOiB7XG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICB9LFxuICAgICAgdnVlVGVtcGxhdGU6IHRydWUsXG4gICAgfSksXG4gICAgQ29tcG9uZW50cyh7XG4gICAgICBkdHM6ICdzcmMvY29tcG9uZW50cy5kLnRzJyxcbiAgICB9KSxcbiAgICBWdWUoe1xuICAgICAgdGVtcGxhdGU6IHsgdHJhbnNmb3JtQXNzZXRVcmxzIH0sXG4gICAgfSksXG4gICAgVnVldGlmeSh7XG4gICAgICBhdXRvSW1wb3J0OiB0cnVlLFxuICAgICAgc3R5bGVzOiB7XG4gICAgICAgIGNvbmZpZ0ZpbGU6ICdzcmMvc3R5bGVzL3NldHRpbmdzLnNjc3MnLFxuICAgICAgfSxcbiAgICB9KSxcbiAgICBGb250cyh7XG4gICAgICBmb250c291cmNlOiB7XG4gICAgICAgIGZhbWlsaWVzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1JvYm90bycsXG4gICAgICAgICAgICB3ZWlnaHRzOiBbMTAwLCAzMDAsIDQwMCwgNTAwLCA3MDAsIDkwMF0sXG4gICAgICAgICAgICBzdHlsZXM6IFsnbm9ybWFsJywgJ2l0YWxpYyddLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgIH0pLFxuICBdLFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBleGNsdWRlOiBbXG4gICAgICAndnVldGlmeScsXG4gICAgICAndnVlLXJvdXRlcicsXG4gICAgICAndW5wbHVnaW4tdnVlLXJvdXRlci9ydW50aW1lJyxcbiAgICAgICd1bnBsdWdpbi12dWUtcm91dGVyL2RhdGEtbG9hZGVycycsXG4gICAgICAndW5wbHVnaW4tdnVlLXJvdXRlci9kYXRhLWxvYWRlcnMvYmFzaWMnLFxuICAgIF0sXG4gIH0sXG4gIGRlZmluZTogeyAncHJvY2Vzcy5lbnYnOiB7fSB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCdzcmMnLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICB9LFxuICAgIGV4dGVuc2lvbnM6IFtcbiAgICAgICcuanMnLFxuICAgICAgJy5qc29uJyxcbiAgICAgICcuanN4JyxcbiAgICAgICcubWpzJyxcbiAgICAgICcudHMnLFxuICAgICAgJy50c3gnLFxuICAgICAgJy52dWUnLFxuICAgIF0sXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDMwMDAsXG4gIH0sXG4gIGNzczoge1xuICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgICAgIHNhc3M6IHtcbiAgICAgICAgYXBpOiAnbW9kZXJuLWNvbXBpbGVyJyxcbiAgICAgIH0sXG4gICAgICBzY3NzOiB7XG4gICAgICAgIGFwaTogJ21vZGVybi1jb21waWxlcicsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHRlc3Q6IHtcbiAgICBnbG9iYWxzOiB0cnVlLFxuICAgIGVudmlyb25tZW50OiAnanNkb20nLFxuICAgIHNldHVwRmlsZXM6ICcuL3NyYy90ZXN0L3NldHVwLnRzJyxcbiAgICBkZXBzOiB7XG4gICAgICBpbmxpbmU6IFsndnVldGlmeSddLFxuICAgIH0sXG4gICAgZXhjbHVkZTogW1xuICAgICAgLi4uY29uZmlnRGVmYXVsdHMuZXhjbHVkZSxcbiAgICAgICdlMmUvKionLCBcbiAgICBdLFxuICB9LFxufSkiXSwKICAibWFwcGluZ3MiOiAiO0FBR0EsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sYUFBYTtBQUNwQixPQUFPLFNBQVM7QUFDaEIsT0FBTyxlQUFlO0FBQ3RCLFNBQVMsNEJBQTRCO0FBQ3JDLE9BQU8sV0FBVywwQkFBMEI7QUFHNUMsU0FBUyxvQkFBb0I7QUFDN0IsU0FBUyxlQUFlLFdBQVc7QUFDbkMsU0FBUyxzQkFBc0I7QUFmK0ssSUFBTSwyQ0FBMkM7QUFrQi9QLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLFVBQVU7QUFBQSxNQUNSLEtBQUs7QUFBQSxJQUNQLENBQUM7QUFBQSxJQUNELFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxNQUNULFNBQVM7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxVQUNFLE9BQU8sQ0FBQyxlQUFlLGFBQWE7QUFBQSxRQUN0QztBQUFBLE1BQ0Y7QUFBQSxNQUNBLEtBQUs7QUFBQSxNQUNMLFVBQVU7QUFBQSxRQUNSLFNBQVM7QUFBQSxNQUNYO0FBQUEsTUFDQSxhQUFhO0FBQUEsSUFDZixDQUFDO0FBQUEsSUFDRCxXQUFXO0FBQUEsTUFDVCxLQUFLO0FBQUEsSUFDUCxDQUFDO0FBQUEsSUFDRCxJQUFJO0FBQUEsTUFDRixVQUFVLEVBQUUsbUJBQW1CO0FBQUEsSUFDakMsQ0FBQztBQUFBLElBQ0QsUUFBUTtBQUFBLE1BQ04sWUFBWTtBQUFBLE1BQ1osUUFBUTtBQUFBLFFBQ04sWUFBWTtBQUFBLE1BQ2Q7QUFBQSxJQUNGLENBQUM7QUFBQSxJQUNELE1BQU07QUFBQSxNQUNKLFlBQVk7QUFBQSxRQUNWLFVBQVU7QUFBQSxVQUNSO0FBQUEsWUFDRSxNQUFNO0FBQUEsWUFDTixTQUFTLENBQUMsS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEdBQUc7QUFBQSxZQUN0QyxRQUFRLENBQUMsVUFBVSxRQUFRO0FBQUEsVUFDN0I7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRLEVBQUUsZUFBZSxDQUFDLEVBQUU7QUFBQSxFQUM1QixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLGNBQWMsSUFBSSxJQUFJLE9BQU8sd0NBQWUsQ0FBQztBQUFBLElBQ3BEO0FBQUEsSUFDQSxZQUFZO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsS0FBSztBQUFBLElBQ0gscUJBQXFCO0FBQUEsTUFDbkIsTUFBTTtBQUFBLFFBQ0osS0FBSztBQUFBLE1BQ1A7QUFBQSxNQUNBLE1BQU07QUFBQSxRQUNKLEtBQUs7QUFBQSxNQUNQO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE1BQU07QUFBQSxJQUNKLFNBQVM7QUFBQSxJQUNULGFBQWE7QUFBQSxJQUNiLFlBQVk7QUFBQSxJQUNaLE1BQU07QUFBQSxNQUNKLFFBQVEsQ0FBQyxTQUFTO0FBQUEsSUFDcEI7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLEdBQUcsZUFBZTtBQUFBLE1BQ2xCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
