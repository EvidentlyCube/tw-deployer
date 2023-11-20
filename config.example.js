/* Copy this file to `config.js`, remove this comment and update configuration

const Config = {
	// Port used by TW Deployer
	Port: 8001,

	// Tiddlywiki instances will start from this port
	TwPortCountFrom: 8080,

	// Duration, in millisecond, how long a CSRF token is valid
	CsrfTokenValidityMs: 10 * 1000,

	// Maximum size of a POST request in bytes
	PostLimit: 10 * 1024 * 1024,

	// How many backups to keep
	NumberOfBackupsToKeep: 10,

	// How many job logs to keep
	JobLogsToKeep: 30,

	// Login details to TW Deployer
	Username: "",
	Password: "",

	// Hostname, must not include the final slash
	Hostname: "",

	Logs: {
		// Whether to output core logs to console
		OutputCoreLogsToConsole: true,

		// Whether to store core logs on the disk
		StoreCoreLogs: true,

		// Whether to output access logs to console
		OutputAccessLogsToConsole: true,

		// Whether to store access logs on the disk
		StoreAccessLogs: false,

	},

	// Paths to various things
	Paths: {
		// Where the logs are stored
		Logs: "/var/log/tw-deployer/",

		// Path to an nginx configuration file that will be used for adding new TW instances
		NginxConfig: "/etc/nginx/sites-available/example.com",

		// Path where the wikis are stored
		Wikis: "/root/htdocs/tiddlywikis",
	}
};

export default Config;

/**/