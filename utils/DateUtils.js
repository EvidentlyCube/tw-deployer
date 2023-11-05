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