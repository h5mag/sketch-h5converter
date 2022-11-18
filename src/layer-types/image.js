import {Asset} from "./asset.js";

const sketch = require('sketch');

export class Image extends Asset {
	base64 = true;
	frame = {};

	constructor(layer, parentOrigin) {
		super(layer, parentOrigin);
		this.hasAlpha = layer.image.nsimage.representations()[0].hasAlpha();
		this.extension = (this.hasAlpha) ? 'png' : 'jpg';
		if (layer.parent.type === "Group") {
			this.frame.x = 0;
			this.frame.y = 0;
		}
		this.image = this.getBuffer();
	}

	/**
	 * @func getBuffer
	 * This function returns the base64 string for an image
	 * @returns {string}
	 */
	getBuffer() {
		let buffer = sketch.export(this.layer, {
			formats: 'png',
			output: false,
			scales: 2,
			'save-for-web': true,
		});
		return buffer.toString('base64');
	}
}