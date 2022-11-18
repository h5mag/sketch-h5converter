export class H5magObject {

	constructor(layer, type, root = false) {
		this.sketchId = layer.id;
		this.type = type;
		this.identifier = layer.name;
		this.name = layer.name;
		this.style = {
			"landscape": {
				"height": layer.frame.height + 'px',
				"width": (layer.base64) ? "auto" : layer.frame.width + 'px',
				"position": "absolute",
			}
		}
		if (!root) { //Don't add these styles to an artboard since the artboard is root (0,0)
			this.style.landscape['left'] = layer.frame.x + 'px';
			this.style.landscape['top'] = layer.frame.y + 'px';
		}
	}
}