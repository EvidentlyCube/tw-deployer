const Config = {
	// Port used by TW Deployer
	Port: parseInt(process.env.TWD_PORT ?? 8001),

	// Array of port ranges. Must be an array of 2-element arrays where the first element
	// is the start of the range and second is the end of the range.
	TwPortRanges: decodePorts(process.env.TWD_WIKI_PORT_RANGES ?? '8100 8199'),

	// Duration, in millisecond, how long a CSRF token is valid
	CsrfTokenValidityMs: parseInt(process.env.TWD_CSRF_VALIDITY_MS ?? 10 * 1000),

	// Duration, in milliseconds, how long a one-time auth token is valid
	OneTimeCodeValidityMs: parseInt(process.env.TWD_ONE_TIME_TOKEN_VALIDITY_MS ?? 10 * 1000),

	// Maximum size of a POST request in bytes
	PostLimit: parseInt(process.env.TWD_POST_MAX_SIZE_BYTES ?? 10 * 1024 * 1024),

	// Login details to TW Deployer
	Username: parseInt(process.env.TWD_USERNAME ?? "admin"),
	Password: parseInt(process.env.TWD_PASSWORD ?? "admin"),

	// Hostname, must not include the final slash
	Hostname: process.env.TWD_HOSTNAME,

	// How many backups of each wiki to keep
	NumberOfBackupsToKeep: parseInt(process.env.TWD_BACKUPS_TO_KEEP ?? 10),

	// How many Job logs to keep
	JobLogsToKeep: parseInt(process.env.TWD_JOB_LOGS_TO_KEEP ?? 30),

	// Paths to various things
	Paths: {
		// Where the logs are stored
		Logs: process.env.TWD_PATH_LOGS ?? "/var/log/tw-deployer/",

		// Directory to store backups
		Backups: process.env.TWD_PATH_BACKUPS ?? "/root/htdocs/backups",

		// Path to an nginx directory that contains all configurations for Wikis
		NginxConfigDir: process.env.TWD_PATH_NGINX ?? "/etc/nginx/sites-available/example.com",

		// Path where the wikis are stored
		Wikis: process.env.TWD_PATH_WIKIS ?? "/root/htdocs/tiddlywikis",
	},

	Advanced: {
		// If `true` then automatic nginx restart is not performed and the check
		// if `sudo service nginx reload` is available is skipped
		ManualNginxRestart: parseBool(process.env.TWD_ADV_MANUAL_NGINX ?? false),

		// Host used for nginx locations, use this docker container's name
		// if using docker
		NginxHost: process.env.TWD_ADV_NGINX_HOST ?? 'http://127.0.0.1',

		// Overrides TW host option, use "0.0.0.0" if you want wikis to be accessible
		// over the network
		TiddlyWikiHost: process.env.TWD_ADV_TW_HOST ?? 'http://127.0.0.1',
	}
};

function decodePorts(string) {
	const ranges = [];
	const bits = string.split(' ');
	for (let i = 0; i < bits.length - 1; i++) {
		const startPort = parseInt(bits[i]);
		const endPort = parseInt(bits[i + 1]);

		if (
			Number.isNaN(startPort) || !Number.isFinite(startPort) || startPort < 1 || startPort > 65535
			|| Number.isNaN(endPort) || !Number.isFinite(endPort) || endPort < 1 || endPort > 65535
		) {
			continue;
		}

		if (startPort <= endPort) {
			ranges.push([startPort, endPort]);
		} else {
			ranges.push([endPort, startPort]);
		}
	}

	return ranges;
}

function parseBool(string) {
	switch (typeof string) {
		case 'boolean': return string;
		case 'number': return !!string;
		case 'object': return true;
		case 'string':
			string = string.toLocaleLowerCase();
			var number = parseInt(string);
			if (Number.isNaN(number)) {
				return string === "true" || string === "1" || string === "yes";
			} else {
				return !!number;
			}
		default:
			return !!string;
	}
}

export default Config;