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

export function formatSize(size, decimals = null, spaces = 0) {
	const infix = " ".repeat(spaces);

	if (size < 1000) {
		return `${toDigits(size, decimals)}${infix}B`;

	} else if (size < 1000 ** 2) {
		return `${toDigits(size / 1000, decimals)}${infix}KB`;

	} else if (size < 1000 ** 3) {
		return `${toDigits(size / 1000 / 1000, decimals)}${infix}MB`;

	} else if (size < 1000 ** 4) {
		return `${toDigits(size / 1000 / 1000 / 1000, decimals)}${infix}GB`;

	} else {
		return `${toDigits(size / 1000 / 1000 / 1000 / 1000, decimals)}${infix}TB`;
	}
}

export function toDigits(number, decimals = null) {
	if (decimals !== null) {
		return number.toFixed(decimals);
	}

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

export function showButton($button) {
	if ($button.classList.contains("hide")) {
		$button.classList.remove("hide");

		if ($button.offsetWidth === 0) {
			return;
		}

		const buttonWidth = $button.offsetWidth;
		$button.setAttribute("data-full-width", buttonWidth);
		$button.style.transition = "none";
		$button.style.width = 0;
		$button.style.padding = 0;
		$button.style.margin = 0;
		$button.classList.add("hiding");
		reflow($button);
		$button.style.transition = "";
		$button.style.width = "";
		$button.style.padding = "";
		$button.style.margin = "";
		reflow($button);
		$button.style.width = `${buttonWidth}px`;
		$button.classList.remove("hiding");
	} else {
		const buttonWidth = $button.getAttribute("data-full-width");
		$button.style.width = `${buttonWidth}px`;
		$button.classList.remove("hiding");
	}

	const timeoutId = setTimeout(() => {
		$button.removeAttribute("data-timeout");
		$button.style.width = "";
	}, 500);

	$button.setAttribute("data-timeout", timeoutId);
}

export function hideButton($button) {
	if (!$button.hasAttribute("data-full-width") && !$button.offsetWidth) {
		$button.classList.add("hide");
		return;
	}

	const timeoutId = $button.getAttribute("data-timeout");
	if (timeoutId) {
		clearTimeout(timeoutId);
		$button.removeAttribute("data-timeout");
	}

	if (!$button.hasAttribute("data-full-width")) {
		$button.setAttribute("data-full-width", $button.offsetWidth);
	}

	const buttonWidth = $button.getAttribute("data-full-width");

	$button.style.width = `${buttonWidth}px`;
	reflow($button);
	$button.classList.add("hiding");
	$button.style.width = "";
}

function reflow($element) {
	const value = $element.offsetWidth;

	if (Math.random() > 999) {
		console.log(value);
	}
}