/* Copy this file to `config.js`, remove this comment and update configuration

const Config = {
	// Port used by TW Deployer
	Port: 8001,

	// Array of port ranges. Must be an array of 2-element arrays where the first element
	// is the start of the range and second is the end of the range.
	TwPortRanges: [
		[8100, 8199]
	],

	// Duration, in millisecond, how long a CSRF token is valid
	CsrfTokenValidityMs: 10 * 1000,

	// Duration, in milliseconds, how long a one-time auth token is valid
	OneTimeCodeValidityMs: 10 * 1000,

	// Maximum size of a POST request in bytes
	PostLimit: 10 * 1024 * 1024,

	// Login details to TW Deployer
	Username: "",
	Password: "",

	// Hostname, must not include the final slash
	Hostname: "",

	// How many backups of each wiki to keep
	NumberOfBackupsToKeep: 10,

	// How many Job logs to keep
	JobLogsToKeep: 30,

	// Paths to various things
	Paths: {
		// Where the logs are stored
		Logs: "/var/log/tw-deployer/",

		// Directory to store backups
		Backups: "/root/htdocs/backups",

		// Path to an nginx directory that contains all configurations for Wikis
		NginxConfigDir: "/etc/nginx/sites-available/example.com",

		// Path where the wikis are stored
		Wikis: "/root/htdocs/tiddlywikis",
	},

	Advanced: {
		// If `true` then automatic nginx restart is not performed and the check
		// if `sudo service nginx reload` is available is skipped
		ManualNginxRestart: false
	}
};

export default Config;

/**/