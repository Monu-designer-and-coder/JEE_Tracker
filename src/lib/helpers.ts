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
