import { exec } from "node:child_process";

export async function execPromise(command) {
	return new Promise(resolve => {
		exec(command, (error, stdout, stderr) => {
			resolve({ code: error?.code ?? 0, stdout, stderr });
		});
	});
}

export async function execPromiseLogged(command, log) {
	log(`Executing: ${command}`);
	const { code, stdout, stderr } = await execPromise(command);
	log("Execution finished.");
	log(`CODE=${code}`);
	log(`STDOUT=${stdout}`);
	log(`STDERR=${stderr}`);

	return { code, stdout, stderr };
}

export async function isPortOpen(port) {
	const { stdout } = await execPromise("lsof -i -P -n");

	return stdout.split("\n")
		.filter(row => row.includes(`:${port} `))
		.filter(row => row.includes("TCP"))
		.filter(row => row.includes("(LISTEN)")).length === 0;
}