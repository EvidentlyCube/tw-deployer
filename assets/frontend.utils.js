

export function formatTime(time) {
	const seconds = (time / 1000 | 0) & 60;
	const minutes = (time / 1000 / 60 | 0) % 60;
	const hours = (time / 1000 / 60 / 60 | 0) % 60;
	const days = (time / 1000 / 60 / 60 / 24 | 0);

	if (days >= 1) {
		return `${days}d ${hours}h`;
	} else if (hours >= 1) {
		return `${hours}h ${minutes}m`;
	} else if (minutes >= 1) {
		return `${minutes}m ${seconds}s`;
	} else if (seconds >= 1) {
		return `${seconds}s`;
	} else {
		return "<1s";
	}
}

export function formatSize(size) {
	if (size < 1000) {
		return `${size}B`;

	} else if (size < 1000 ** 2) {
		return `${toDigits(size / 1000)}KB`;

	} else if (size < 1000 ** 3) {
		return `${toDigits(size / 1000 / 1000)}MB`;

	} else if (size < 1000 ** 4) {
		return `${toDigits(size / 1000 / 1000 / 1000)}GB`;

	} else {
		return `${toDigits(size / 1000 / 1000 / 1000 / 1000)}TB`;
	}
}

export function toDigits(number) {
	if (number >= 1000) {
		return number;
	} else if (number >= 100) {
		return number.toFixed(1);
	} else if (number >= 10) {
		return number.toFixed(2);
	} else {
		return number.toFixed(3);
	}
}