import * as http from "node:http";
import Config from "./config.js";

import { routeErrorHandler, routeRequest } from "./router.js";
import { getRoutes } from "./routes/routes.js";

const routesData = getRoutes();

export async function initServer() {
	http
		.createServer(async (req, res) => {
			try {
				if (!authenticate(req, res)) {
					return;
				}

				if (await routeRequest(routesData, req, res)) {
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
		})
		.listen(Config.Port);
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