// * ==========================================================================
// * Helper Methods
// * ==========================================================================

import { cn } from './utils';

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
		className = 'text-informative-1';
	} else if (diffInDays === -1) {
		className = 'text-progressive-1';
	} else if (diffInDays === -2) {
		className = 'text-cautionary-1';
	} else if (diffInDays === -3) {
		className = 'text-radiative-1';
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

export function getColorsClassAsPerPercentage() {
	return cn(
		'bg-[var(--mix-light-bg)] text-[var(--mix-light-text)] dark:bg-[var(--mix-dark-bg)] dark:text-[var(--mix-dark-text)] ',
	);
}

// Maps your exact Light and Dark mode variables for each stop
export const PROGRESS_STOPS_COLORS = {
	destructive: {
		lBg: 'destructive',
		dBg: 'destructive-1',
		lText: 'foreground',
		dText: 'foreground',
	},
	cautionary: {
		lBg: 'cautionary',
		dBg: 'cautionary-1',
		lText: 'foreground',
		dText: 'foreground',
	},
	radiative: {
		lBg: 'radiative',
		dBg: 'radiative-1',
		lText: 'foreground',
		dText: 'foreground',
	},
	progressive: {
		lBg: 'progressive',
		dBg: 'progressive-1',
		lText: 'foreground',
		dText: 'foreground',
	},
	informative: {
		lBg: 'informative',
		dBg: 'informative-1',
		lText: 'foreground',
		dText: 'foreground',
	},
	mystical: {
		lBg: 'mystical',
		dBg: 'mystical-1',
		lText: 'foreground',
		dText: 'foreground',
	},
	majestic: {
		lBg: 'majestic',
		dBg: 'majestic-1',
		lText: 'foreground',
		dText: 'foreground',
	},
};

export function getDynamicGradientStyle(
	percentage: number,
): React.CSSProperties {
	const p = Math.max(0, Math.min(100, percentage));

	// 100% or above (Solid Purple)
	if (p >= 100) {
		return {
			'--mix-light-bg': `var(--color-${PROGRESS_STOPS_COLORS.majestic.lBg})`,
			'--mix-dark-bg': `var(--color-${PROGRESS_STOPS_COLORS.majestic.dBg})`,
			'--mix-light-text': `var(--color-${PROGRESS_STOPS_COLORS.majestic.lText})`,
			'--mix-dark-text': `var(--color-${PROGRESS_STOPS_COLORS.majestic.dText})`,
		} as React.CSSProperties;
	}

	// Determine color boundaries
	let c1 = PROGRESS_STOPS_COLORS.destructive,
		c2 = PROGRESS_STOPS_COLORS.radiative,
		p1 = 0,
		p2 = 30;

	if (p >= 30 && p < 45) {
		c1 = PROGRESS_STOPS_COLORS.radiative;
		c2 = PROGRESS_STOPS_COLORS.cautionary;
		p1 = 30;
		p2 = 45;
	} 
	else if (p >= 45 && p < 60) {
		c1 = PROGRESS_STOPS_COLORS.cautionary;
		c2 = PROGRESS_STOPS_COLORS.progressive;
		p1 = 45;
		p2 = 60;
	}
	else if (p >= 60 && p < 75) {
		c1 = PROGRESS_STOPS_COLORS.progressive;
		c2 = PROGRESS_STOPS_COLORS.informative;
		p1 = 60;
		p2 = 75;
	}
	else if (p >= 75 && p < 90) {
		c1 = PROGRESS_STOPS_COLORS.informative;
		c2 = PROGRESS_STOPS_COLORS.mystical;
		p1 = 75;
		p2 = 90;
	}
	 else if (p >= 90) {
		c1 = PROGRESS_STOPS_COLORS.mystical;
		c2 = PROGRESS_STOPS_COLORS.majestic;
		p1 = 90;
		p2 = 100;
	}

	// Mix ratio relative to the current boundary
	const mix = Math.round(((p - p1) / (p2 - p1)) * 100);

	// Return the mathematically mixed variables
	return {
		'--mix-light-bg': `color-mix(in srgb, var(--color-${c2.lBg}) ${mix}%, var(--color-${c1.lBg}))`,
		'--mix-dark-bg': `color-mix(in srgb, var(--color-${c2.dBg}) ${mix}%, var(--color-${c1.dBg}))`,
		'--mix-light-text': `color-mix(in srgb, var(--color-${c2.lText}) ${mix}%, var(--color-${c1.lText}))`,
		'--mix-dark-text': `color-mix(in srgb, var(--color-${c2.dText}) ${mix}%, var(--color-${c1.dText}))`,
	} as React.CSSProperties;
}

export function getReferenceGradientProps() {
	// 1. Map the STOPS to their specific percentages in strict ascending order
	const orderedStops = [
		{ stop: PROGRESS_STOPS_COLORS.destructive, percent: 0 },
		{ stop: PROGRESS_STOPS_COLORS.radiative, percent: 30 },
		{ stop: PROGRESS_STOPS_COLORS.cautionary, percent: 45 },
		{ stop: PROGRESS_STOPS_COLORS.progressive, percent: 60 },
		{ stop: PROGRESS_STOPS_COLORS.informative, percent: 75 },
		{ stop: PROGRESS_STOPS_COLORS.mystical, percent: 90 },
		{ stop: PROGRESS_STOPS_COLORS.majestic, percent: 100 },
	];

	// 2. Build the CSS linear-gradient string for Light Mode
	const lightStopsString = orderedStops
		.map(({ stop, percent }) => `var(--color-${stop.lBg}) ${percent}%`)
		.join(', ');

	// 3. Build the CSS linear-gradient string for Dark Mode
	const darkStopsString = orderedStops
		.map(({ stop, percent }) => `var(--color-${stop.dBg}) ${percent}%`)
		.join(', ');

	return {
		// Tailwind classes targeting the dynamic background-image variables
		className:
			'[background-image:var(--ref-light-bg)] dark:[background-image:var(--ref-dark-bg)]',
		style: {
			'--ref-light-bg': `linear-gradient(to right, ${lightStopsString})`,
			'--ref-dark-bg': `linear-gradient(to right, ${darkStopsString})`,
		} as React.CSSProperties,
	};
}

// ! getColorsClassAsPerPercentage:
// *Legacy
export function __getColorsClassAsPerPercentage(percentage: number) {
	if (percentage >= 100) {
		return 'bg-majestic-1 text-majestic dark:bg-majestic dark:text-majestic-1';
	}
	if (100 > percentage && percentage >= 90) {
		return 'bg-mystical-1 text-mystical dark:bg-mystical dark:text-mystical-1';
	}
	if (90 > percentage && percentage >= 75) {
		return 'bg-informative-1 text-informative dark:bg-informative dark:text-informative-1';
	}
	if (75 > percentage && percentage >= 60) {
		return 'bg-progressive-1 text-progressive dark:bg-progressive dark:text-progressive-1';
	}
	if (60 > percentage && percentage >= 45) {
		return 'bg-cautionary-1 text-cautionary dark:bg-cautionary dark:text-cautionary-1';
	}
	if (45 > percentage && percentage >= 30) {
		return 'dark:bg-radiative bg-radiative-1 dark:text-radiative-1 text-radiative';
	}
	if (30 > percentage) {
		return `dark:bg-destructive bg-destructive-1 dark:text-destructive-1 text-destructive`;
	}
}
