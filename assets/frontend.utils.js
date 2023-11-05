

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