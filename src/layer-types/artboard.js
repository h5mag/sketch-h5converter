import Util from "../Util/MyUtil";
import {Text} from "./text";
import {Image} from "./image";
import {Svg} from "./svg";
import {H5magObject} from "./H5magObject";
import {Group} from "./group";
import {Asset} from "./asset";
const sketch = require('sketch');

export class Artboard extends H5magObject {
	children = [];
	layers = [];
	root = true;
	assets = [];
	fonts = [];
	settings;

	constructor(layer, settings) {
		layer = sketch.fromNative(layer);
		super(layer, 'section', true);
		this.id = layer.id;
		this.name = layer.name;
		this.settings = settings;
		if (layer.background && layer.background.enabled) {
			this.style.landscape["background-color"] =  layer.background.color;
		}
		this.title = Util.titleToKey(layer.name);
		this.initializeLayers(layer);
	}

	/**
	 * @func initializeLayers
	 * This function initializes the layers, adding them as children to an artboard or group
	 * It also fetches an assets array based on the image for easy exports
	 * @param artboard
	 */
	initializeLayers(artboard) {
		let artboardSizes = Util.getPos(artboard._object.absoluteInfluenceRect());
		artboard.layers.forEach(layer => {
			if (layer.hidden) return; //wysiwyg, we do not export hidden layers
			if (this.settings.footer && Artboard.detectFooter(layer.frame, artboard.frame)) return; //Skip the footer in the design if the settings allow it
			try {
				let obj = Artboard.typeLayer(layer, this.article, artboardSizes);
				if (obj) {
					if (obj.style.landscape['font-family'] && !this.fonts.includes(obj.style.landscape['font-family'])) {
						this.fonts.push(obj.style.landscape['font-family']);
					}
					this.assets = Asset.makeAssetObj(obj, this.assets);
					this.children.push(obj);
				}
			} catch (e) {
				console.error("Artboard Error: " + e.message);
			}
		});
		Util.changeDuplicates(this.assets, 'name');
		Util.changeDuplicates(this.children, 'name');
	}

	/**
	 * @func typeLayer
	 * This function creates the right H5mag object based on the layer type
	 * @param layer
	 * @param article
	 * @throws TypeError
	 * @returns {Text|{}|Image|Svg}
	 */
	static typeLayer(layer, article, origin) {
		switch (layer.type) {
			case 'Group':
				return new Group(layer, article);
			case 'Text':
				return new Text(layer);
			case 'Image':
				return new Image(layer, origin);
			case 'Shape':
			case 'ShapePath':
			case 'SymbolInstance':
				return new Svg(layer, origin);
			case 'HotSpot':
				return null; // A hotspot is a relation between artboards which is not supported in H5mag.
			default:
				console.warn('Unsupported type: ' + layer.type);
				return null;
		}
	}

	/**
	 * @function detectFooter
	 * This function determines whether an area is a footer element or not
	 * @param layer
	 * @param artboard
	 * @returns {boolean}
	 */
	static detectFooter(layer, artboard) {
		let footerHeight = 45;
		return ((layer.width === artboard.width) && (layer.height === footerHeight) && (layer.x === 0) && ((artboard.height - layer.y) === footerHeight));
	}
}