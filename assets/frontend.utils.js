import { dm } from "./frontend.dm.js";

const matches = [
	[/^DD/, date => date.getDate().toString().padStart(2, "0")],
	[/^D/, date => date.getDate().toString()],
	[/^MM/, date => (date.getMonth() + 1).toString().padStart(2, "0")],
	[/^M/, date => (date.getMonth() + 1).toString()],
	[/^YYYY/, date => date.getFullYear().toString()],
	[/^hh/, date => date.getHours().toString().padStart(2, "0")],
	[/^mm/, date => date.getMinutes().toString().padStart(2, "0")],
	[/^ss/, date => date.getSeconds().toString().padStart(2, "0")],
	[/^lll/, date => date.getMilliseconds().toString().padStart(3, "0")],
];

export function formatDate(format, date) {
	date = date ? new Date(date) : new Date();

	let formatted = "";
	while (format.length > 0) {
		let hadMatch = false;
		for (const [regexp, callback] of matches) {
			const match = format.match(regexp);

			if (match) {
				hadMatch = true;
				formatted += callback(date);
				format = format.substring(match[0].length || 1);
				break;
			}
		}

		if (!hadMatch) {
			formatted += format.charAt(0);
			format = format.substring(1);
		}
	}

	return formatted;
}

export function formatTime(time) {
	const seconds = (time / 1000 | 0) % 60;
	const minutes = (time / 1000 / 60 | 0) % 60;
	const hours = (time / 1000 / 60 / 60 | 0) % 60;
	const days = (time / 1000 / 60 / 60 / 24 | 0);
	const weeks = (time / 1000 / 60 / 60 / 24 / 7 | 0);
	const months = (time / 1000 / 60 / 60 / 24 / 30.437 | 0);
	const years = (time / 1000 / 60 / 60 / 24 / 365.25 | 0);

	if (years >= 1) {
		return `${years}years`;

	} else if (months >= 3) {
		return `${months}months`;

	} else if (weeks >= 1) {
		return `${weeks}weeks ${days % 7}d`;

	} else if (days >= 1) {
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

export function removeElements(elements) {
	if (Array.isArray(elements) || elements instanceof NodeList) {
		elements.forEach(element => removeElements(element));

	} else if (elements && elements.parentElement) {
		elements.remove();
	}
}

export function setDisabled(source, query, value = undefined) {
	if (Array.isArray(query)) {
		query.forEach(subQuery => setDisabled(source, subQuery, value));

	} else if (query instanceof HTMLElement) {
		query.disabled = value;

	} else if (!source) {
		throw new Error("Expected source to be set");

	} else {
		source.querySelectorAll(query).forEach(element => element.disabled = value);
	}

}

export async function sleep(duration) {
	return new Promise(resolve => {
		setTimeout(resolve, duration);
	});
}

export function addSpinner($to) {
	const $spinner = $to.q(".spinner") || dm("~spinner");

	const timeoutId = $spinner.getAttribute("data-timeout");

	if (timeoutId) {
		clearTimeout(timeoutId);
		$spinner.removeAttribute("data-timeout");
		$spinner.classList.remove("hiding");
	}

	if ($spinner.parentElement !== $to) {
		$to.appendChild($spinner);
	}
}
export function removeSpinner($from) {
	const $spinner = $from.q(".spinner");

	if (!$spinner || $spinner.getAttribute("data-timeout")) {
		return;
	}

	$spinner.classList.add("hiding");
	$spinner.setAttribute("data-timeout", setTimeout(() => {
		$spinner.remove();
	}, 250));
}