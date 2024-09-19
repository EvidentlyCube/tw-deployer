import { CONFIG_isManualNginxRestart } from "./utils/ConfigUtils.js";
import { execPromise } from "./utils/ExecUtils.js";

export async function validateServer() {
	await expectCommand("pm2 --version", "pm2");
	await expectCommand("tar --version", "tar");
	await expectCommand("zip --version", "zip");
	await expectCommand("unzip -v", "unzip");

	if (!CONFIG_isManualNginxRestart()) {
		await expectSudo("service nginx reload");
	}
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

async function expectSudo(command) {
	const { code, stderr } = await execPromise(`sudo -l ${command}`);

	if (code) {
		console.error("Cannot sudo the following command:");
		console.error(`    sudo ${command}`);
		console.error("TW Deployer requires the ability to sudo this command to function properly.");
		console.error(`Error code: ${code}`);
		console.error(`Response: ${stderr}`);
		process.exit(1);
	}
}