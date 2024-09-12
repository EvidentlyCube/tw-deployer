import { execPromiseLogged } from "./ExecUtils.js";

export function isSupportedArchive(fileName) {
	return fileName.endsWith(".tar")
		|| fileName.endsWith(".tar.gz")
		|| fileName.endsWith(".zip");
}

export async function universalDecompress(source, target, log = null) {
	if (!isSupportedArchive(source)) {
		throw new Error(`Unsupported archive type: ${source}`);
	}

	if (source.endsWith(".tar.gz") || source.endsWith(".tar")) {
		const { code, stderr } = await execPromiseLogged(`tar -xf ${source} -C ${target}`, log);

		if (code) {
			throw new Error(`Failed to decompress with error: ${stderr}`);
		}
	} else if (source.endsWith(".zip")) {
		const { code, stderr } = await execPromiseLogged(`unzip '${source}' -d '${target}'`, log);

		if (code) {
			throw new Error(`Failed to decompress with error: ${stderr}`);
		}
	} else {
		throw new Error(`Expected archive to be supported but code for decompressing it was missing: ${source}`);
	}
}