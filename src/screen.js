import BrowserWindow from 'sketch-module-web-view';

const sketch = require('sketch/dom');

export class Screen {

	constructor(state, webviewIdentifier, width, height) {
		this.state = state;

		let options = {
			identifier: webviewIdentifier,
			width: width,
			height: height,
			show: true,
			hidesOnDeactivate: false,
			alwaysOnTop: true,
			resizable: false,
		}
		this.browserWindow = new BrowserWindow(options);
	}

	/**
	 * @func closeScreen
	 * Closes the plugin's screens
	 */
	closeScreen() {
		this.browserWindow.close()
	}

	/**
	 * @func showLogout
	 * This functions shows the views to handle the user logging out
	 */
	showLogout() {
		if (this.state.user.getUserDefault('apikey')) {
			//User is logged in
			this.browserWindow.webContents.loadURL(require('../resources/pages/logout.html'));
		} else {
			//No active user found
			this.browserWindow.webContents.loadURL(require('../resources/pages/logout-done.html'));
		}
	}

	/**
	 * @func showFonts
	 * This function shows the fonts view and the projects belonging to a user
	 * @returns {Promise<void>}
	 */
	async showFonts() {
		await this.browserWindow.webContents.loadURL(require('../resources/pages/fonts.html'));
		let projects = await this.state.getProjects();
		this.browserWindow.webContents.executeJavaScript(`setProjects(${JSON.stringify(projects)})`).catch(console.error);
	}

	/**
	 * @func showSettings
	 * This function shows the view for the user to edit the settings
	 * @returns {Promise<void>}
	 */
	async showSettings() {
		await this.browserWindow.webContents.loadURL(require('../resources/pages/settings.html'));
		if (!this.state.settings) {
			this.state.settings = {
				'footer': false,
				'popup': false,
				'artboard': false,
			};
		}
		await this.browserWindow.webContents.executeJavaScript(`setSettings(${JSON.stringify(this.state.settings)})`);
	}

	/**
	 * @func login
	 * Async function to handle the login of the user
	 * @returns {Promise<void>}
	 */
	async login(destiny) {
		await this.browserWindow.webContents.loadURL('https://account.' + this.state.hostname + '/plugin-login');
		this.browserWindow.webContents.on('h5mag-successful-login', apikey => {
			(async () => {
				await this.state.user.setUserDefault('apikey', apikey);
				this.state.settings = JSON.parse(this.state.user.getUserDefault('settings'));
				await this.browserWindow.close();
				this.state.screen = this.state.bindScreen(destiny, 800, 600);
				switch (destiny) {
					case 'h5magconverterfonts':
						await this.state.screen.showFonts();
						break;
					case 'h5magconvertermain':
						await this.state.screen.selectProjectEdition();
						break;
					case 'h5magconvertersettings':
						await this.state.screen.showSettings();
						break;
					default:
						console.error('undefined screen');
				}
			})();
		});
	}

	/**
	 * @func selectProjectEdition
	 * This function loads the views for the selection of project and edition and passes in all the
	 * user's projects.
	 * @returns {Promise<void>}
	 */
	async selectProjectEdition() {
		await this.browserWindow.webContents.loadURL(require('../resources/pages/selectDestiny.html'));
		let projectsAndEditions = await this.state.getProjectsAndEditions();
		this.browserWindow.webContents.executeJavaScript(`setProjects(${JSON.stringify(projectsAndEditions)})`).catch(console.error);
	}

	/**
	 * @func finishLoading
	 * This function executes the JS when the export is finished
	 * @returns {Promise<void>}
	 */
	async finishLoading(warnings) {
		await this.browserWindow.webContents.executeJavaScript(`finishLoading(${JSON.stringify(warnings)})`);
	}

	/**
	 * @func selectArtboards
	 * This function passes the artboards to the view
	 * @returns {Promise<void>}
	 */
	async selectArtboards() {
		await this.browserWindow.webContents.loadURL(require('../resources/pages/selectArea.html'));
		await this.browserWindow.webContents.executeJavaScript(`displayDestiny(${JSON.stringify(this.state.selectedProject)})`);
		let content = [];
		let pages = context.document.pages();
		let id = 0;
		for (let i = 0; i < pages.length; i++) {
			let artboards = [];
			const boards = pages[i].artboards();
			//Only select pages with one or more artboards and not the one with symbols
			if (boards.length < 1 || pages[i].name() == 'Symbols') {
				continue;
			}
			for (let j = 0; j < boards.length; j++) {
				id++;
				const artboard = boards[j];
				this.state.exportableArtboards[id] = artboard;
				let obj = {
					'id': id,
					'name': artboard.name() + '',
					'artboardData': artboard,
					'selected': artboard.isSelected(),
				};

				//Only if the user allows artboardpictures to be exported
				if (!this.state.settings.artboard) {
					obj['image'] = "data:image/png;base64," + sketch.export(artboard, {
						'scales': 0.2,
						'output': false,
						'formats': 'png'
					}).toString('base64');

				}
				artboards.push(obj);
			}
			content.push({'name': pages[i].name() + '', 'artboards': artboards});
		}
		await this.browserWindow.webContents.executeJavaScript(`displayArtboards(${JSON.stringify(content)})`);
	}

	/**
	 * @func showError
	 * This function loads an error page
	 */
	showError() {
		this.browserWindow.webContents.loadURL(require('../resources/pages/error.html'));
	}
}

