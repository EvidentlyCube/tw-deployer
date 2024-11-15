import * as http from "node:http";
import Config from "./config.js";

import { routeErrorHandler, routeRequest } from "./router.js";
import { Routes } from "./routes/routes.js";
import { AccessLog } from "./utils/Logger.js";
import { areAllSharedWikisClosed } from "./utils/SharedRunner.js";

export async function initServer() {
	const routeHandler = async (req, res) => {
		AccessLog("server", `${req.method} ${req.url}`);

		try {
			if (!authenticate(req, res)) {
				return;
			}

			if (await routeRequest(Routes, req, res)) {
				return;
			}

			if (req.url.startsWith("/?api=")) {
				const json = JSON.stringify({
					error: "Endpoint not found",
					body: null
				});
				res.writeHead(404, {
					"Content-Length": json.length,
					"Content-Type": "application/json",
				});
				res.write(json);
			} else {
				const body = "Page not found";
				res.writeHead(404, {
					"Content-Length": body.length,
					"Content-Type": "text/plain",
				});
				res.write(body);
			}

			res.end();

		} catch (e) {
			await routeErrorHandler(e, req, res);
		}
	};

	const server = http.createServer(routeHandler);
	server.listen(Config.Port, () => {
		console.log(server.address());
		console.log(`Server listening on ${Config.Port}`);
	});

	let isShuttingDown = false;
	const onShutdown = (signal) => {
		console.log("Received shutdown signal: " + signal);

		if (isShuttingDown) {
			return;
		}

		console.log("Shutting down");

		isShuttingDown = true;

		const tryKill = () => {
			if (areAllSharedWikisClosed()) {
				console.log("Attempt exit now");
				process.exit(0);
			}
		};

		server.close(() => {
			setInterval(tryKill, 50);
		});
	}

	process.on('SIGTERM', onShutdown);
	process.on('SIGQUIT', onShutdown);
	process.on('SIGPWR', onShutdown);
	process.on('SIGINT', onShutdown);

}

function authenticate(req, res) {
	const authHeader = req.headers.authorization;

	const respondFailure = () => {
		res.writeHead(401, {
			"Content-Length": 0,
			"Content-Type": "text/plain",
			"WWW-Authenticate": "Basic realm=\"TW Deployer\""
		});
		res.end();

		return false;
	};
	if (!authHeader) {
		return respondFailure();
	}

	const authBits = authHeader.split(" ");

	if (authBits.length !== 2 || authBits[0] !== "Basic") {
		return respondFailure();
	}

	const decoded = Buffer.from(authBits[1], "base64").toString();
	const decodedBits = decoded.split(":");

	if (
		decodedBits.length !== 2
		|| decodedBits[0] !== Config.Username
		|| decodedBits[1] !== Config.Password
	) {
		return respondFailure();
	}

	return true;
}