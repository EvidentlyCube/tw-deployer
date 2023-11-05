
export function dm(tag, options) {
	if (tag === "~spinner") {
		return dm("div", { class: "spinner" });
	}

	if (typeof options === "string") {
		options = { text: options };
	} else if (options instanceof HTMLElement) {
		options = { child: options };
	} else if (Array.isArray(options)) {
		if (options[0] instanceof HTMLElement) {
			options = { child: options };
		}
	} else {
		options = options || {};
	}

	const element = document.createElement(tag);

	for (const key in options) {
		switch (key) {
		case "text":
			element.innerText = options[key];
			break;
		case "html":
			element.innerHTML = options[key];
			break;
		case "class":
			element.className = options[key];
			break;
		case "href":
		case "target":
		case "value":
			element[key] = options[key];
			break;
		case "child":
			options.child = Array.isArray(options.child) ? options.child : [options.child];

			options.child.forEach(child => {
				if (typeof child === "string") {
					element.appendChild(document.createTextNode(child));
				} else {
					element.appendChild(child);
				}
			});
			break;
		default:
			if (key.startsWith("data-")) {
				element.setAttribute(key, options[key]);
			} else {
				console.error(`Unknown dm() option '${key}'`);
			}
			break;
		}
	}

	return element;
}