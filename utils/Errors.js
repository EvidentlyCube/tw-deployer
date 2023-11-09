export class ApiError {
	constructor(errorCode, message) {
		this.statusCode = errorCode;
		this.message = message;
	}
}

export class ActionError {
	constructor(message) {
		this.message = message;
	}
}

export class CsrfError {
	constructor(message) {
		this.message = message;
	}
}

export class OneTimeCodeError {
	constructor(message) {
		this.message = message;
	}
}

export class NotFoundError {
	constructor() { }
}