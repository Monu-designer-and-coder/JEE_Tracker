// * ==========================================================================
// * Constants
// * ==========================================================================

/**
 * * Local storage keys for data caching
 * ? Prevents magic strings and ensures consistency
 */
export const STORAGE_KEYS = {
	STUDY_SESSION: 'studySession',
	TODAYS_PROGRESS: 'todaysProgress',
} as const;

export const TOPIC_COMPLETION_SEQUENCE = [
	'theory',
	'inTextQuestions',
	'inClassQuestions',
] as const;

// * ---------------------------------------------------------------------
// * Order matters — this is the exact order a chapter's tags must clear.
// * The chapter-status endpoint slices it into 3 "inProgress" rounds:
// *   Round 1 (0-3): theory, shortNotes, PYQ_Mains, PYQ_Advanced
// *   Round 2 (4-6): DPP1, mindMap, Module
// *   Round 3 (7-8): DPP2, Book  -> final round: chapter goes to "done"
// *                                 directly, skipping "unFinished".
// * ---------------------------------------------------------------------
export const CHAPTER_COMPLETION_SEQUENCE = [
	'theory',
	'shortNotes',
	'PYQ_Mains',
	'mindMap',  // * 1st inProgress round
	'DPP1',
	'PYQ_Advanced',
	'Module', // * 2nd inProgress round
	'DPP2',
	'Book', // * 3rd / final inProgress round
] as const;

export type ChapterCompletionTag = (typeof CHAPTER_COMPLETION_SEQUENCE)[number];

// * Mirrors chapter.model.ts's own MIN_REQUIRED_RESOURCES — kept here too
// * so the API layer can reject a "markAsUnfinished" call *before* ever
// * hitting the DB, instead of relying only on the model's own guard.
export const MIN_TAGS_FOR_FIRST_UNFINISHED = 4;

export interface iSTUDY_TARGETS {
	questionsDone: number;
	timeStudied: number;
	score: number;
}

export function calculateDayScore(questions: number, timeStudied: number) {
	// return Math.round((questions * 1000000 + timeStudied) / 200000); //? Prev
	return Math.round((questions * 120000 + timeStudied) / 60000)
}
export function convertHoursToMilliseconds(time: number) {
	return time * 60 * 60 * 1000;
}

const DAILY_TARGETED_HOUR: string = process.env
	.NEXT_PUBLIC_DAILY_TARGETED_HOUR as string;
const DAILY_TARGETED_QUESTIONS: string = process.env
	.NEXT_PUBLIC_DAILY_TARGETED_QUESTIONS as string;

if (!DAILY_TARGETED_HOUR) {
	throw new Error(
		'Please define the DAILY_TARGETED_HOUR environment variable inside .env',
	);
}
if (!DAILY_TARGETED_QUESTIONS) {
	throw new Error(
		'Please define the DAILY_TARGETED_QUESTIONS environment variable inside .env',
	);
}

export const DAILY_STUDY_TARGETS: iSTUDY_TARGETS = {
	questionsDone: Number(DAILY_TARGETED_QUESTIONS),
	timeStudied: convertHoursToMilliseconds(Number(DAILY_TARGETED_HOUR)),
	score: calculateDayScore(
		Number(DAILY_TARGETED_QUESTIONS),
		convertHoursToMilliseconds(Number(DAILY_TARGETED_HOUR)),
	),
};

export const WEEKLY_STUDY_TARGETS: {
	weekly_8D: iSTUDY_TARGETS;
	weekly_7D: iSTUDY_TARGETS;
} = {
	weekly_8D: {
		questionsDone: DAILY_STUDY_TARGETS.questionsDone * 8,
		timeStudied: DAILY_STUDY_TARGETS.timeStudied * 8,
		score: DAILY_STUDY_TARGETS.score * 8,
	},
	weekly_7D: {
		questionsDone: DAILY_STUDY_TARGETS.questionsDone * 7,
		timeStudied: DAILY_STUDY_TARGETS.timeStudied * 7,
		score: DAILY_STUDY_TARGETS.score * 7,
	},
};

export function CALCULATE_PERCENT_TARGET_ACHIEVED(
	type: 'd' | 'w7' | 'w8',
	current: iSTUDY_TARGETS,
): iSTUDY_TARGETS {
	if (type === 'd') {
		return {
			questionsDone:
				(current.questionsDone * 100) / DAILY_STUDY_TARGETS.questionsDone,
			timeStudied:
				(current.timeStudied * 100) / DAILY_STUDY_TARGETS.timeStudied,
			score: (current.score * 100) / DAILY_STUDY_TARGETS.score,
		};
	} else if (type === 'w8') {
		return {
			questionsDone:
				(current.questionsDone * 100) /
				WEEKLY_STUDY_TARGETS.weekly_8D.questionsDone,
			timeStudied:
				(current.timeStudied * 100) /
				WEEKLY_STUDY_TARGETS.weekly_8D.timeStudied,
			score: (current.score * 100) / WEEKLY_STUDY_TARGETS.weekly_8D.score,
		};
	} else {
		return {
			questionsDone:
				(current.questionsDone * 100) /
				WEEKLY_STUDY_TARGETS.weekly_7D.questionsDone,
			timeStudied:
				(current.timeStudied * 100) /
				WEEKLY_STUDY_TARGETS.weekly_7D.timeStudied,
			score: (current.score * 100) / WEEKLY_STUDY_TARGETS.weekly_7D.score,
		};
	}
}
