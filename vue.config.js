module.exports = {
  transpileDependencies: ["vuetify"],
  pluginOptions: {
    electronBuilder: {
      externals: ["chokidar"],
      outputDir: "dist",
      removeElectronJunk: false,
      nodeIntegration: true,
      builderOptions: {
        productName: "Drawer",
        mac: {
          darkModeSupport: true
        },
        dmg: {
          artifactName: "Drawer-v${version}.${ext}",
          title: "Drawer"
        },
        nsis: {
          artifactName: "Drawer-v${version}.${ext}",
          deleteAppDataOnUninstall: true,
          shortcutName: "Drawer",
          uninstallDisplayName: "Drawer"
        }
      }
    }
  },
  devServer: {
    https: false,
    proxy: {
      "^/api": {
        target: "https://www.theparadigmdev.com",
        changeOrigin: true,
        ws: true,
        cookieDomainRewrite: {
          "*": ""
        }
      }
    }
  }
};
