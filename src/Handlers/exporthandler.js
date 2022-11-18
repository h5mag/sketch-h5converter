import {Artboard} from "../layer-types/artboard.js";

export class ExportHandler {
	artboards = [];
	assets = {};
	article = null;
	fails = [];
	warnings = [];

	constructor(state) {
		this.state = state;
	}

	/**
	 * @func startExport
	 *  This function starts the export of the selected elements in Sketch
	 *  It first loops through the selection to build H5mag objects
	 *  Then it exports all the assets
	 *  Then it will export the artboard
	 * @returns {Promise<void>}
	 */
	async startExport() {
		await this.loopThroughSelection();
		let exportedAssets = await this.state.uploadAssets(this.assets);
		this.bindAssestsToArtboards(exportedAssets);
		await this.exportArtboards();
		await this.state.screen.finishLoading(this.warnings);
	}

	/**
	 * @func loopThroughSelection
	 * This function loops through all the artboards
	 * If no artboard is found it creates an artboard per layer
	 */
	async loopThroughSelection() {
		for (const selected of this.state.selectedArtboards) {
			let artboard = new Artboard(this.state.exportableArtboards[selected], this.state.settings);
			artboard.article = await this.state.createArticle(artboard.title);
			if (artboard.assets && artboard.assets.length > 0) {
				this.assets[artboard.article] = artboard.assets;
			}
			artboard.viewId = selected;
			this.artboards.push(artboard);
		}
	}

	/**
	 * @func exportArtboards
	 * This function exports artboards to H5mag
	 * @returns {Promise<boolean|*>}
	 */
	async exportArtboards() {
		for (const artboard of this.artboards) {
			if (!this.fails[artboard.viewId]) {
				if (!await this.state.createArea(artboard)) {
					this.fails.push(artboard.viewId);
					this.warnings[artboard.viewId].push('Server error: Check your internet connection and try again...');
				} else {
					this.getWarnings(artboard);
				}
			}
		}
	}

	/**
	 * @func bindAssetsToArtboards
	 * @param assets array of uploaded assets
	 * If an artboard has assets this function couples the uploaded asset to the right object
	 */
	bindAssestsToArtboards(assets) {
		let assetArr = {};
		//Make an array based on sketchId = serverId
		for (const serverArticle in assets) {
			for (let i = 0; i < assets[serverArticle].length; i++) {
				assetArr[assets[serverArticle][i].meta.external_identifier] = assets[serverArticle][i].identifier;
			}
		}
		let bindAssetsToChildren = function (children, assetArr) {
			for (let i = 0; i < children.length; i++) {
				if (children[i].type === 'image') {
					children[i].content = {}; //init content
					children[i].content.identifier = assetArr[children[i].sketchId];
					children[i].identifier = children[i].name;
					//No need to repost the BASE64 string nor the layer information
					children[i].image = '';
					children[i].layer = '';
				}
				if (children[i].children && children[i].children.length > 0) {
					bindAssetsToChildren(children[i].children, assetArr);
				}
			}
		}
		for (const artboard of this.artboards) {
			if (assets[artboard.article] && artboard.assets.length > 0) {
				bindAssetsToChildren(artboard.children, assetArr);
				artboard.assets = '';
			}
		}
	}

	/**
	 * @func getWarnings this function determines whether the artboard is successfully uploaded to H5mag or if there's a need
	 * for warning the users. The following warnings are given:
	 * - fonts warning: Tells the user if the font is available in H5mag
	 * - Size warning: Tells the user if the artboard is of the same size as the edition
	 * - Server warning: When an upload fails the user is notified (warning is added at the server fail)
	 * @param artboard
	 */
	getWarnings(artboard) {
		this.warnings[artboard.viewId] = [];
		//Check if the fonts exists
		let fontsWarn = false;
		let missingFonts = 'The following fonts are not available in your project: '; // lib text
		let sep = ', ';
		artboard.fonts.forEach(font => {
			if (!this.state.selectedProject.fonts.includes(font)) {
				missingFonts += font + sep;
				fontsWarn = true;
			}
		});
		if (fontsWarn) this.warnings[artboard.viewId].push(missingFonts.substring(0, missingFonts.length - 2));//Remove last comma
		//Check if the size is compatible
		let editionStyle = this.state.selectedProject.selectedEdition.settings.Landscape;
		let artboardWidth = artboard.style.landscape.width.substring(0, artboard.style.landscape.width.length -2);
		let editionWidth = editionStyle.extWidth ? editionStyle.extWidth : editionStyle.width;
		if (editionWidth != artboardWidth) {
			this.warnings[artboard.viewId].push('The artboard (' + artboardWidth + ') is not the same width as your selected edition (' + editionWidth + ')');
		}
	}
}
