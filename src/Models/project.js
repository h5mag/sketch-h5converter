import {Edition} from './edition.js';

export class Project {
	domain;
	editions = [];

	constructor() {
		this.selectedEdition = new Edition();
	}
}
