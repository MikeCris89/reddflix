export const log = {
	info: (msg: string, meta?: object) =>
		console.log(`[INFO] ${msg}`, meta ?? ""),
	warn: (msg: string, meta?: object) =>
		console.warn(`[WARN] ${msg}`, meta ?? ""),
	error: (msg: string, meta?: object) =>
		console.error(`[ERROR] ${msg}`, meta ?? ""),
};
