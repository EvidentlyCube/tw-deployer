import { execPromise } from "./utils/ExecUtils.js";

export async function validateServer() {
	await expectCommand("pm2 --version", "pm2");
	await expectCommand("tar --version", "tar");
	await expectCommand("zip --version", "zip");
	await expectCommand("unzip -v", "unzip");
}

async function expectCommand(command, tool) {
	const { code, stderr } = await execPromise(command);

	if (code) {
		console.error(`Command ${command} has failed.`);
		console.error(`TW Deployer requires ${tool} to be installed on the server`);
		console.error(`Error code: ${code}`);
		console.error(`Response: ${stderr}`);
		process.exit(1);
	}
}