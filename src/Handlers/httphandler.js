export class HttpHandler {

	constructor(state) {
		this.state = state;
	}

	/**
	 * @func send this function sends the HTTP request and returns the promise object
	 * @param url always uses secure connection with HTTPS
	 * @param method
	 * @param body
	 * @returns {Promise<{error}|*>}
	 */
	async send(url, method, body) {
		let displayErrorLog = function (url, msg) {
			console.error('fetch to ' + url + ' failed');
			console.error(msg);
		}
		let obj;
		let lowerUrl = 'https://' + url.toLowerCase();
		await fetch(lowerUrl,
			{
				method: method,
				body: body,
				headers:
					{
						"Authenticate": this.state.user.getUserDefault('apikey'),
						"Version": "1.0"
					}
			})
			.then(response => response.text())
			.then(text => {
				try {
					if (text === 'Invalid key') {
						displayErrorLog(lowerUrl, 'Invalid key - IMPLEMENT LOGGING LOAD SCREEN');
					} else {
						obj = JSON.parse(text);
						if (obj.status === 'error') {
							displayErrorLog(lowerUrl, obj);
						}
					}
				} catch (err) {
					displayErrorLog(lowerUrl, obj)
				}
			})
			.catch(e => displayErrorLog(lowerUrl, e));
		return obj;
	}
}
