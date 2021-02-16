module.exports = {
	transpileDependencies: ['vuetify'],
	pluginOptions: {
		electronBuilder: {
			externals: ['chokidar'],
			outputDir: 'dist',
			removeElectronJunk: false,
			nodeIntegration: true,
			builderOptions: {
				productName: 'Drawer',
				appId: 'com.theparadigmdev.drawer',
				mac: {
					darkModeSupport: true,
					target: 'dmg'
				},
				dmg: {
					artifactName: 'Drawer-v${version}.${ext}',
					title: 'Drawer'
				},
				win: {
					target: 'nsis'
				},
				nsis: {
					artifactName: 'Drawer-v${version}.${ext}',
					deleteAppDataOnUninstall: true,
					shortcutName: 'Drawer',
					uninstallDisplayName: 'Drawer'
				},
				linux: {
					target: 'deb'
				},
				deb: {
					artifactName: 'Drawer-v${version}.${ext}'
				}
			}
		}
	}
};
