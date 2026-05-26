import { createTransform } from "redux-persist";
import { isAppHandledError } from "../utils/types";

export const sanitizeQueries = createTransform(
	(inboundState, key) => {
		if (key !== "queries") return inboundState;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const cleaned: Record<string, any> = {};
		for (const [cacheKey, entry] of Object.entries(inboundState ?? {})) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const e = entry as any;

			// Stuck-pending → never persist (would hang forever on rehydrate)
			if (e?.status === "pending") {
				// keep the data if it has any, drop the pending status
				if (e?.data) cleaned[cacheKey] = { ...e, status: "fulfilled" };
				continue;
			}

			if (e?.status === "rejected") {
				const err = e.error;
				const isLiveRateLimit =
					isAppHandledError(err) &&
					err?.data.reason === "rateLimit" &&
					err?.data.pendingTimestamp > Date.now();

				if (isLiveRateLimit) {
					cleaned[cacheKey] = e; // keep error intact → countdown resumes
				} else if (e?.data) {
					cleaned[cacheKey] = { ...e, status: "fulfilled", error: undefined };
				}
				// rejected, not live rate limit, no data → drop entirely
				continue;
			}

			cleaned[cacheKey] = e; // fulfilled → keep
		}
		return cleaned;
	},
	(outboundState) => outboundState,
	{ whitelist: ["queries"] },
);
