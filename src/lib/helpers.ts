// * ==========================================================================
// * Helper Methods
// * ==========================================================================

// * Formats date cleanly using Intl API to avoid manual month indexing bugs
export const formatDate = (dateText: string) => {
	if (!dateText) return '';
	const date = new Date(dateText);
	return new Intl.DateTimeFormat('en-IN', {
		weekday: 'short',
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	}).format(date);
};
export const formatTime = (dateText: string) => {
	if (!dateText) return '';
	const date = new Date(dateText);
	return new Intl.DateTimeFormat('en-IN', {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hourCycle: 'h23',
	}).format(date);
};

// 2. The wrapper function combining both the exact date and the relative diff
export const getDaysAgoText = (dateText: string) => {
	if (!dateText) {
		return { assignDate: '', value: '', className: '' };
	}

	// Get the exact formatted date string (e.g., "Thu, 13 Aug 2026")
	const assignDate = formatDate(dateText);

	// Calculate the difference logic
	const targetDate = new Date(dateText);
	const today = new Date();

	targetDate.setHours(0, 0, 0, 0);
	today.setHours(0, 0, 0, 0);

	const diffInMs = targetDate.getTime() - today.getTime();
	const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

	const rtf = new Intl.RelativeTimeFormat('en-IN', { numeric: 'auto' });
	const value = rtf.format(diffInDays, 'day');

	let className = '';
	if (diffInDays >= 0) {
		className = 'text-progressive-1';
	} else if (diffInDays === -1) {
		className = 'text-informative-1';
	} else if (diffInDays === -2) {
		className = 'text-cautionary-1';
	} else {
		className = 'text-destructive-1';
	}

	// Return the combined object
	return {
		assignDate, // "Thu, 13 Aug 2026"
		value, // "today", "yesterday", "2 days ago", etc.
		className, // "text-progressive-1", etc.
	};
};

export function formatMilliseconds(ms: number): string {
	const totalSeconds = Math.floor(ms / 1000);
	const seconds = totalSeconds % 60;
	const totalMinutes = Math.floor(totalSeconds / 60);
	const minutes = totalMinutes % 60;
	const hours = Math.floor(totalMinutes / 60);

	const pad = (num: number) => String(num).padStart(2, '0');

	return `${pad(hours)}.${pad(minutes)}.${pad(seconds)}`;
}

export function interleaveArrays<T>(arrays: T[][]): T[] {
	let totalElements = 0;
	let maxLength = 0;

	// 1. Calculate dimensions to pre-allocate memory and find the longest array
	for (let i = 0; i < arrays.length; i++) {
		const len = arrays[i].length;
		totalElements += len;
		if (len > maxLength) {
			maxLength = len;
		}
	}

	// 2. Pre-allocate the result array for maximum performance
	const result = new Array<T>(totalElements);
	let currentIndex = 0;

	// 3. Loop column-by-column, then row-by-row
	for (let col = 0; col < maxLength; col++) {
		for (let row = 0; row < arrays.length; row++) {
			// Only read if the current array actually has an element at this column index
			if (col < arrays[row].length) {
				result[currentIndex++] = arrays[row][col];
			}
		}
	}

	return result;
}

export function getRandomInt(min: number, max: number): number {
	const minCeiled = Math.ceil(min);
	const maxFloored = Math.floor(max);
	return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}

export function capitalizeWords(str: string) {
	if (!str) return '';
	return str
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}
