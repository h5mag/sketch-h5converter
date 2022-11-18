import {onShutdown} from "../plugin";
import {ExportHandler} from './exporthandler.js'

export class EventHandler {

	constructor(state) {
		//Listener to select artboard btn
		state.screen.browserWindow.webContents.on('select-artboard', (artboards) => {
			state.export = new ExportHandler(state);
			artboards = JSON.parse(artboards);
			state.progress.total = artboards.length;
			state.selectedArtboards = artboards;
			(async () => {
				await state.export.startExport();
			})();
		});
		//Listener to logout btn
		state.screen.browserWindow.webContents.on('logout', () => {
			state.user.removeUserDefault('apikey');
			state.user.removeUserDefault('destination');
			onShutdown();
		});
		//Listener to the cancel btn
		state.screen.browserWindow.webContents.on('cancel', () => {
			onShutdown();
		});
		//Listener when the button is clicked after selecting project and edition
		state.screen.browserWindow.webContents.on('destination-selected', (project) => {
			state.selectedProject = project;
			state.user.setUserDefault('destination', JSON.stringify(state.selectedProject)).then(r => {
				state.selectArtboards();
			});
		});
		//Listener when the button is hit to change the selected project and edition
		state.screen.browserWindow.webContents.on('change-destination', () => {
			state.selectProjectEdition();
		});
		//Listener when a project is selected to find the fonts
		state.screen.browserWindow.webContents.on('findFonts', (projectDomain) => {
			state.findFonts(projectDomain);
		});
		//Listener to open a browser window when it is clicked
		state.screen.browserWindow.webContents.on('openFontsBrowser', (projectdomain) => {
			state.openFontsWindow(projectdomain);
		});
		//Listener to open a browser window when it is clicked
		state.screen.browserWindow.webContents.on('openH5mag', () => {
			state.openH5magWindow();
		});
		//Listener to save the settings
		state.screen.browserWindow.webContents.on('settingsSave', (settings) => {
			state.saveSettings(settings);
		})
	}
}