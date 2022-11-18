import {env} from "../env";

const sketch = require('sketch');

export default {
	basename,
	changeNameIfDuplicate,
	changeDuplicates,
	titleToKey,
	nl2br,
	findMaxDate,
	getPos,
	getCSSAttributesAsString,
}

function basename(str, sep) {
	return str.substr(str.lastIndexOf(sep) + 1);
}

/**
 * @func changeNameIfDuplicate
 * This function compares the names in the list to the object and changes the objects name if found
 * @param object
 * @param list
 */
function changeNameIfDuplicate(object, list) {
	for (let i = 0; i < list.length; i++) {
		if (list[i].name === object.name) {
			object.name = object.name + "-1";
		}
	}
}

/**
 * @func findMaxDate
 * This function returns the latest date in an array
 * @param array
 * @param key
 * @returns {Date}
 */
function findMaxDate(array, key) {
	return new Date(
		Math.max(...array.map(element => {
			if (typeof element[key] === "string") {
				return new Date(element[key].replace(' ', 'T'));
			}
			return new Date(element[key]);
		}))
	);
}

/**
 * @func changeDuplicates
 * This function checks for duplicates in the supplied list of objects indexed by the key
 * If there are duplicates this adds a number behind one of the instances
 * @param list dictionary with duplicate keys
 * @param key to sort by
 */
function changeDuplicates(list, key) {
	let originals = {};
	list.forEach(obj => {
		if (originals[obj[key]]) {
			obj[key] += '-' + ++originals[obj[key]];
		}
		originals[obj[key]] = 1;
	});
}

/**
 * @func titleToKey
 * This function converts a title to a key
 * @param str
 * @returns {string}
 */
function titleToKey(str) {
	return str.toLowerCase()
		.replace(/[^-\w]/g, '_')
		.replace(/_+/g, '_')
		.replace(/^_|_$/g, '')
		.replace(/^\s*|\s*$/g, '');
}

/**
 * @func nl2br
 * Inserts HTML line breaks
 * @param str
 * @param is_xhtml
 * @returns {string}
 */
function nl2br(str, is_xhtml = true) {
	str = str.replace(/</g,"&lt;").replace(/>/g,"&gt;");
	let breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>';
	return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}

/**
 * @func getCSSAttributesAsString
 * This function gets the CSS attributes and returns them as strings in an array
 * @param layer Sketch Layer object
 * @returns {*[]}
 */
function getCSSAttributesAsString(layer) {
	//TODO: THIS ISN'T USED RN BUT MIGHT BE HANDY
	// let attributes = layer.sketchObject.CSSAttributes();
	let attributes = [];
	let arr = [];
	for (let i = 0; i < attributes.length; i++) {
		arr.push(attributes[i]);
	}
	return arr;
}

/**
 * @func getPos This function gets the positions for every coordinate of an object.
 * @param rect IMPORTANT: _object.absoluteInfluenceRect() object
 * @returns {{minY: *, minX, maxY, maxX: *, width, height}}
 */
function getPos(rect) {
	return {
		'minX': rect.origin.x,
		'minY': rect.origin.y + rect.size.height,
		'maxX': rect.origin.x + rect.size.width,
		'maxY': rect.origin.y,
		'width': rect.size.width,
		'height': rect.size.height,
	}
}
