import { ApiError } from '../utils/Errors.js';
import { execPromise } from '../utils/ExecUtils.js';
import { routeToRegexp } from "../utils/RouteUtils.js";
import { respondApiSuccess } from "./respond.js";

export default {
	route: routeToRegexp("/?api=memory-details"),
	action
};

async function action(req, res) {
	const memory = await getMemory();
	const diskUsage = await getDiskUsage();

	console.log(diskUsage)

	return respondApiSuccess(res, {
		memory: {
			total: memory.total,
			available: memory.available,
		},
		disk: {
			total: diskUsage.total,
			available: diskUsage.available,
		}
	});
}

async function getMemory() {
	const { code, stdout, stderr } = await execPromise("free -b");

	if (code) {
		throw new ApiError(500, `Error when trying to get memory info: ${stderr}`)
	}

	const rows = stdout.split("\n").map(row => row.split(/\s+/));

	const totalColumnIndex = rows[0].indexOf('total');
	const availableColumnIndex = rows[0].indexOf('available');

	if (totalColumnIndex === -1) {
		throw new ApiError(500, `Error when trying to get memory info: 'total' column not found ${stdout}`);
	} else if (availableColumnIndex === -1) {
		throw new ApiError(500, `Error when trying to get memory info: 'available' column not found ${stdout}`);
	}

	const memRow = rows.find(row => row[0] === 'Mem:');
	if (!memRow) {
		throw new ApiError(500, `Error when trying to get memory info: 'Mem' row not found ${stdout}`);
	}

	return {
		total: parseInt(memRow[totalColumnIndex]),
		available: parseInt(memRow[availableColumnIndex]),
	}
}

async function getDiskUsage() {
	const { code, stdout, stderr } = await execPromise("df -B1");

	if (code) {
		throw new ApiError(500, `Error when trying to get disk space: ${stderr}`)
	}

	const rows = stdout.split("\n").map(row => row.split(/\s+/));

	const usedColumnIndex = rows[0].indexOf('Used');
	const availableColumnIndex = rows[0].indexOf('Available');
	const mountedOnColumnIndex = rows[0].indexOf('Mounted');

	if (usedColumnIndex === -1) {
		throw new ApiError(500, `Error when trying to get disk space: 'Used' column not found ${stdout}`);
	} else if (availableColumnIndex === -1) {
		throw new ApiError(500, `Error when trying to get disk space: 'Available' column not found ${stdout}`);
	} else if (mountedOnColumnIndex === -1) {
		throw new ApiError(500, `Error when trying to get disk space: 'Mounted' column not found ${stdout}`);
	}

	const rootRow = rows.find(row => row[mountedOnColumnIndex] === '/');
	if (!rootRow) {
		throw new ApiError(500, `Error when trying to get disk space: '/' row not found ${stdout}`);
	}

	return {
		total: parseInt(rootRow[usedColumnIndex]) + parseInt(rootRow[availableColumnIndex]),
		available: parseInt(rootRow[availableColumnIndex]),
	}
}