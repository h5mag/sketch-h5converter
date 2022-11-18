import {Asset} from "./asset.js";

const sketch = require('sketch');

export class Svg extends Asset {
	extension = 'svg';

	constructor(layer, parentOrigin) {
		super(layer, parentOrigin);
		this.image = this.getBuffer();
	}

	getBuffer() {
		let buffer = sketch.export(this.layer, {
			formats: 'svg',
			output: false,
			trimmed: true,
		});
		return buffer.toString();
	}
}