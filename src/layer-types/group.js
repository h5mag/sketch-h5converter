import {H5magObject} from "./H5magObject";
import Util from "../Util/MyUtil";
import {Artboard} from "./artboard";
import {Asset} from "./asset";

export class Group extends H5magObject {
	children = [];
	assets = [];

	constructor(layer, article) {
		super(layer, 'section');
		this.initializeLayers(layer, article);
	}

	/**
	 * @func initializeLayers
	 * This function initializes the layers, adding them as children to the group
	 * It also fetches an assets array based on the image for easy exports
	 * @param group
	 * @param article
	 */
	initializeLayers(group, article) {
		let groupSizes = Util.getPos(group._object.absoluteInfluenceRect());
		group.layers.forEach(layer => {
			try {
				let obj = Artboard.typeLayer(layer, article, groupSizes);
				if (obj) {
					this.assets = Asset.makeAssetObj(obj, this.assets);
					this.children.push(obj);
				}
			} catch (e) {
				console.error("Group Error: " + e.message);
			}
		});
		Util.changeDuplicates(this.assets, 'name');
		Util.changeDuplicates(this.children, 'name');
	}
}