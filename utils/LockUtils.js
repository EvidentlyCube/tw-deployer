
export const LockTypeWikiAction = "wiki-creation";
const locks = new Set();

export function acquireLock(lockType) {
	if (locks.has(lockType)) {
		return false;
	}

	locks.add(lockType);

	return true;
}

export function releaseLock(lockType) {
	locks.delete(lockType);
}