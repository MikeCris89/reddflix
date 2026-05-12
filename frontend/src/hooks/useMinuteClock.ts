import { useSyncExternalStore } from "react";

let listeners: (() => void)[] = [];
let currentMinute = Math.floor(Date.now() / 60000);
let intervalId: ReturnType<typeof setInterval> | null = null;

function subscribe(listener: () => void) {
	listeners.push(listener);
	if (!intervalId) {
		intervalId = setInterval(() => {
			currentMinute = Math.floor(Date.now() / 60000);
			listeners.forEach((l) => l());
		}, 30000);
	}
	return () => {
		listeners = listeners.filter((l) => l !== listener);
		if (listeners.length === 0 && intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
	};
}

function getSnapshot() {
	return currentMinute;
}

export function useMinuteClock() {
	return useSyncExternalStore(subscribe, getSnapshot);
}
