export class User {

	constructor(state) {
		this.userDefaults = NSUserDefaults.alloc().initWithSuiteName("com.sketch.h5converter");
	}

	async setUserDefault(key, value) {
		this.userDefaults.setObject_forKey(value, key);
		await this.userDefaults.synchronize();
	}

	getUserDefault(key) {
		return this.userDefaults.objectForKey(key);
	}

	removeUserDefault(key) {
		this.userDefaults.removeObjectForKey(key);
	}
}


