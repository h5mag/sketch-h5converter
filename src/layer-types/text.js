import {H5magObject} from "./H5magObject";
import Util from "../Util/MyUtil";

export class Text extends H5magObject {

	constructor(layer) {
		super(layer, 'text');
		this.string = layer.text;
		this.style.landscape['font-family'] = layer.style.fontFamily;
		this.style.landscape['line-height'] = layer.style.lineHeight ? layer.style.lineHeight + "px" : layer.style.getDefaultLineHeight() + 'px';
		this.style.landscape['font-size'] = layer.style.fontSize + 'px';
		this.style.landscape['font-style'] = layer.style.fontStyle;
		this.style.landscape['font-weight'] = this.#fontWeights[layer.style.fontWeight];
		this.style.landscape['color'] = layer.style.textColor;
		this.content = '<p>' + Util.nl2br(layer.text) + '</p>';
	}

	/**
	 * Mapping of the string/indexed fontweight to the numbered counterpart
	 * @type {{STYLE : number}}
	 */
	#fontWeights = {
		'THIN': 100,
		2: 100,
		3: 200,
		'EXTRALIGHT': 200,
		'EXTRA_LIGHT': 200,
		'ULTRALIGHT': 200,
		'ULTRA_LIGHT': 200,
		4: 300,
		'LIGHT': 300,
		5: 400,
		'NORMAL': 400,
		'REGULAR': 400,
		6: 500,
		'MEDIUM': 500,
		'SEMIBOLD': 600,
		'SEMI_BOLD': 600,
		'DEMIBOLD': 600,
		'DEMI_BOLD': 600,
		8: 600,
		9: 700,
		'BOLD': 700,
		10: 800,
		'EXTRABOLD': 800,
		'EXTRA_BOLD': 800,
		'ULTRABOLD': 800,
		'ULTRA_BOLD': 800,
		12: 900,
		'BLACK': 900,
		'HEAVY': 900,
	}
}