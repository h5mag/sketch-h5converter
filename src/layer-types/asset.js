import {H5magObject} from "./H5magObject";
import Util from "../Util/MyUtil";

export class Asset extends H5magObject {
	image;
	url;
	identifier;

	constructor(layer, parentOrigin) {
		super(layer, 'image');
		this.layer = layer;
		this.calculatePos(parentOrigin);
	}

	/**
	 * @func calculatePos
	 * This function is needed to get the absolute position of the object. This is important since objects with shadows
	 * are bigger in H5mag than in Sketch (Sketch calculates without shadow, H5mag with)
	 * @param parentOrigin
	 */
	calculatePos(parentOrigin) {
		let ownOrigin = Util.getPos(this.layer._object.absoluteInfluenceRect());
		let left, top, width, height = 0;
		let minX, minY, maxX, maxY = 0;
		if ((ownOrigin.minX >= parentOrigin.minX) && (ownOrigin.maxX <= parentOrigin.maxX) &&
			(ownOrigin.minY <= parentOrigin.minY) && (ownOrigin.maxY >= parentOrigin.maxY)) {
			//The image exists completely inside of the artboard
			left = ownOrigin.minX - parentOrigin.minX;
			top = ownOrigin.maxY - parentOrigin.maxY;
			width = ownOrigin.width;
			height = ownOrigin.height;
		} else { //The image exists partly outside of the artboard and is therefor cropped
			if (ownOrigin.minX < parentOrigin.minX) {
				minX = parentOrigin.minX;
			} else {
				left = ownOrigin.minX - parentOrigin.minX;
				minX = ownOrigin.minX;
			}
			if (ownOrigin.maxY < parentOrigin.maxY) {
				maxY = parentOrigin.maxY;
			} else {
				top = ownOrigin.maxY - parentOrigin.maxY;
				maxY = ownOrigin.maxY;
			}
			maxX = (ownOrigin.maxX > parentOrigin.maxX) ? parentOrigin.maxX : ownOrigin.maxX;
			minY = (ownOrigin.minY > parentOrigin.minY) ? minY = parentOrigin.minY : minY = ownOrigin.minY;
			height = Math.abs(maxY - minY);
			width = Math.abs(maxX - minX);
		}
		this.style.landscape.height = Math.round(height) + 'px';
		this.style.landscape.width = Math.round(width) + 'px';
		this.style.landscape.left = Math.round(left) + 'px';
		this.style.landscape.top = Math.round(top) + 'px';
	}

	/**
	 * @func makeAssetObj
	 * This functionality creates an array of uploadable assets
	 * @param obj to get an Asset Obj from
	 * @param assets
	 * @returns {*}
	 */
	static makeAssetObj(obj, assets) {
		if (obj.assets && obj.assets.length > 0) {
			Array.prototype.push.apply(assets, obj.assets);
		}
		if (obj instanceof Asset) {
			assets.push({
				'name': Util.titleToKey(obj.name),
				'base64': obj.base64,
				'extension': obj.extension,
				'image': obj.image,
				'meta': {
					'external_identifier': obj.sketchId
				},
			});
		}
		return assets;
	}
}