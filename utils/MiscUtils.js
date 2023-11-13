
const SafeCsfValues = /^[-a-zA-Z0-9_!@#$%^&*(){}[\]<>\\/;:+=. ]+$/;
export function isSafeCsvValue(value) {
	return SafeCsfValues.test(value);
}

export function empty(x) {
	return !!x;
}

export function doNull() { }

