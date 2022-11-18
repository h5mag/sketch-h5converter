import {env} from "./env";
import {User} from "./Models/user.js";
import {Project} from "./Models/project.js";
import {HttpHandler} from "./Handlers/httphandler.js";
import {EventHandler} from "./Handlers/eventhandler";
import {getWebview} from 'sketch-module-web-view/remote';
import {Screen} from "./screen";
import Util from "./Util/MyUtil";

const sketch = require('sketch/dom');

/**
 * Class to handle the state of the plugin. This class is responsible for remembering selections, progress and
 * serves as a shell to call the various views(screens).
 */
export class State {
	screen;
	projects = [];
	hostname = env.HOSTNAME;
	export;
	fonts = [];
	contentSelection;
	progress = {
		totalSteps: 10,
	};
	exportableArtboards = {};
	selectedArtboards;
	settings;

	constructor() {
		this.user = new User(this);
		this.selectedProject = new Project();
		this.http = new HttpHandler(this);
	}

	/**
	 * @func opens a new screen
	 * @param id
	 * @param width
	 * @param height
	 * @returns {*}
	 */
	bindScreen(id, width, height) {
		this.screen = new Screen(this, id, width, height);
		this.events = new EventHandler(this);
		return this.screen;
	}

	/**
	 * @func closeScreens
	 * Closes all the possible screens of the program
	 */
	closeScreens() {
		let screens = ['h5magconvertermain', 'h5magconverterlogin', 'h5magconverterlogout', 'h5magerror', 'h5magconverterfonts', 'h5magconvertersettings'];
		screens.forEach(function (val) {
			let screen = getWebview(val);
			if (screen) screen.close();
		});
	}

	/**
	 * @func selectArtboards
	 * This function is to be called internally and closes the screen in place right now to
	 * replace it with a new selectartboards
	 * Opens a screen where the user can select artboards
	 */
	selectArtboards() {
		this.screen.closeScreen();
		this.bindScreen('h5magconvertermain', 800, 600).selectArtboards();
	}

	/**
	 * @func selectProjectEdition
	 * This function is to be called internally and closes the screen in place right now to
	 * replace it with a new selectprojectedition
	 * @returns {Promise<void>}
	 */
	async selectProjectEdition() {
		this.screen.closeScreen();
		this.bindScreen('h5magconvertermain', 800, 600);
		await this.screen.selectProjectEdition();
	}

	/**
	 * @func getProjects
	 * Fetches the projects from the api
	 * @returns {Promise<*[]>} containing projects
	 */
	async getProjectsAndEditions() {
		this.projects = [];
		let response = await this.http.send('api.' + this.hostname + '/projects?expand[]=projects.editions&expand[]=activity&expand[]=artboards', 'POST', '');
		for (let i = 0; i < response.length; i++) {
			let editionsObj = response[i].editions.filter(edition => edition.published == false).filter(e => e.path !== "/master_edition");
			let editions = [];
			for (let j = 0; j < editionsObj.length; j++) {
				editions.push({
					'title': editionsObj[j].title,
					'path': editionsObj[j].path,
					'settings': editionsObj[j].artboards,
					'edited': new Date(editionsObj[j].modified.replace(' ', 'T')),
				});
			}
			let fontsUrl = response[i].domain + '/api/1/show-fonts.json';
			let fontsProject = await this.http.send(fontsUrl, 'GET', null);

			this.projects.push({
				'title': response[i].title,
				'domain': response[i].domain,
				'edited': Util.findMaxDate(editions, 'edited'),
				'editions': editions,
				'fonts': fontsProject,
			});
		}
		return this.projects;
	}

	/**
	 * @func getProjects
	 * This function only gets the projects and their domains
	 * @returns {Promise<*[]>}
	 */
	async getProjects() {
		let projects = [];
		let response = await this.http.send('api.' + this.hostname + '/projects', 'POST', '');
		for (let i = 0; i < response.length; i++) {
			projects.push({
				'title': response[i].name,
				'domain': response[i].domain,
			});
		}
		return projects;
	}

	/**
	 * @func createArticle
	 * @param name
	 * @returns {Promise<void>}
	 */
	async createArticle(name) {
		let domain = this.selectedProject.domain;
		let path = this.selectedProject.selectedEdition.path;
		let url = domain + '/api/1/editions' + path + '/articles/' + name + '/create';
		let body = JSON.stringify({title: 'pluginArticle', master: 0});
		let response = await this.http.send(url, 'POST', body);
		return response.name;
	}

	/**
	 * @func createArea This function sends the call to create an area, if this call is successful the screenshot is created
	 * @param artboard
	 * @returns {Promise<boolean>}
	 */
	async createArea(artboard) {
		let domain = this.selectedProject.domain;
		let path = this.selectedProject.selectedEdition.path;
		let baseUrl = domain + '/api/1/editions' + path + '/articles/' + artboard.article;
		let body = JSON.stringify(artboard);
		let resp = await this.http.send(baseUrl + '/areas/create', 'POST', body);
		if (resp && resp.identifier) {
			await this.http.send(baseUrl + '/screenshot/', 'POST', '');
			return true
		}
		return false;
	}

	/**
	 * @func uploadAsset
	 * This function uploads the assets per article to the API
	 * @param assets
	 * @returns {Promise<void>}
	 */
	async uploadAssets(assets) {
		let domain = this.selectedProject.domain;
		let path = this.selectedProject.selectedEdition.path;
		let exportedAssets = {};
		for (const article in assets) {
			let articleAssets = [];
			const chunkSize = 20;
			let url = domain + '/api/1/editions' + path + '/articles/' + article + '/assets';
			for (let i = 0; i < assets[article].length; i += chunkSize) {
				let assetsToUpload = assets[article].slice(i, i + chunkSize);
				let body = JSON.stringify(assetsToUpload);
				let response = await this.http.send(url, 'POST', body);
				if (response && response.asset_files) {
					articleAssets = articleAssets.concat(response.asset_files);
					if (response.asset_files.length !== assetsToUpload.length) {
						console.error('FAILED ASSETS DIFFERENT AMOUNT OF ASSETS');
					}
				} else {
					console.error('FAILED ASSETS UPLOAD');
				}
			}
			exportedAssets[article] = articleAssets;
		}
		return exportedAssets;
	}

	/**
	 * @func findFonts
	 * This function finds the fonts per project and per artboard
	 * @param project
	 * @returns {Promise<void>}
	 */
	async findFonts(project) {
		let url = project + '.' + this.hostname + '/api/1/show-fonts.json';
		let allFonts = [];
		let fontsProject = await this.http.send(url, 'GET', null);
		//Lazy loading of fonts since this is an intensive process and won't be changed if the plugin is already running
		if (this.fonts.length < 1) {
			let pages = context.document.pages();
			for (let i = 0; i < pages.length; i++) {
				const boards = pages[i].artboards();
				if (boards.length < 1 || pages[i].name() == 'Symbols') {
					continue;
				}
				for (let j = 0; j < boards.length; j++) {
					for (let ii = 0; ii < boards[j].layers().length; ii++) {
						if (boards[j].layers()[ii] instanceof MSTextLayer) {
							if (!this.fonts.includes(sketch.fromNative(boards[j].layers()[ii]).style.fontFamily)) {
								this.fonts.push(sketch.fromNative(boards[j].layers()[ii]).style.fontFamily);
							}
						}
					}
				}
			}
		}
		for (let i = 0; i  < this.fonts.length; i++) {
			let included = false;
			for (let j = 0; j < fontsProject.length; j++) {
				if (this.fonts[i].toLowerCase().includes(fontsProject[j].toLowerCase()) ||
					fontsProject[j].toLowerCase().includes(this.fonts[i].toLowerCase())) {
					included = true;
				}
			}
			allFonts.push({
				'name': this.fonts[i],
				'included': included
			});
		}
		await this.screen.browserWindow.webContents.executeJavaScript(`displayFonts(${JSON.stringify(allFonts)})`);
	}

	/**
	 * @func openFontsWindow
	 * This function opens a new browser window or tab on the fonts page of a project, or if no project is selected opens the project view
	 * @param domain
	 */
	openFontsWindow(domain) {
		let url = 'https://' + this.hostname;
		if (domain) {
			url = 'https://' + domain + '.' + this.hostname + '/system/format/fonts';
		}
		this.openUrl(url)
	}

	/**
	 * @func openH5magWindow
	 * This function opens a new Browser window or tab for the user to manage their projects or editions
	 */
	openH5magWindow() {
		this.openUrl('https://' + this.hostname);
	}

	/**
	 * @func saveSettings
	 * This function sets the settings in the state and then stores the settings as a JSON string in the userdefaults
	 * @param settings
	 */
	saveSettings(settings) {
		this.settings = settings;
		this.user.setUserDefault('settings', JSON.stringify(settings));

	}

	/**
	 * @func fetchProgress
	 * @returns {{totalSteps: number}}
	 */
	fetchProgress() {
		return this.progress;
	}

	/**
	 * @func openUrl
	 * Uses Apples internal libraries to go to open a browser and go to the link
	 * @param url to follow
	 */
	openUrl(url) {
		NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(url));
	}
}