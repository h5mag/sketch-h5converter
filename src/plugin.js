import {State} from "./state.js";

let state = new State();

/**
 * @func default
 * This is the default function ran when the user starts the plugin script
 * It initiates the login screens or the showprojects screen
 */
export default function () {
	(async () => {
		if (await loginFlow('h5magconvertermain')) {
			if (!state.user.getUserDefault('destination')) {
				await state.screen.selectProjectEdition();
			} else {
				state.selectedProject = JSON.parse(state.user.getUserDefault('destination'));
				state.screen.selectArtboards();
			}
		}
	})();
}

/**
 * @func loginFlow
 * This function loads the login screen if necessary
 * @param destiny The screen the login needs to redirect to
 * @returns {Promise<boolean>}
 */
async function loginFlow (destiny) {
	if (!state.user.getUserDefault('apikey')) {
		state.bindScreen('h5magconverterlogin', 500, 260);
		await state.screen.login(destiny);
	} else {
		state.settings = JSON.parse(state.user.getUserDefault('settings'));
		state.bindScreen(destiny, 800, 600);
		return true;
	}
}

/**
 * @func onShutdown
 * This function is called when Sketch is closed or when the plugin is removed
 * Add every webViewID to the array of screens to make sure everything is closed.
 */
export function onShutdown() {
	state.closeScreens();
}

/**
 * @func onLogout
 * This function handles the logging out of a logged in user
 */
export function onLogout() {
	state.bindScreen('h5magconverterlogout', 450, 155).showLogout();
}

/**
 * @function onFonts
 * This function handles the user selecting and uploading fonts
 */
export function onFonts() {
	(async() => {
		if (await loginFlow('h5magconverterfonts')) {
			await state.screen.showFonts();
		}
	})();
}

/**
 * @func onSettings This function handles the user changing the settings of the plugin
 */
export function onSettings() {
	(async() => {
		if (await loginFlow('h5magconvertersettings')) {
			await state.screen.showSettings();
		}
	})();
}