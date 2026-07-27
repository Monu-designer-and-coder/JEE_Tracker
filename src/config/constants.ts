
// * ==========================================================================
// * Constants
// * ==========================================================================

/**
 * * Local storage keys for data caching
 * ? Prevents magic strings and ensures consistency
 */
export const STORAGE_KEYS = {
	STUDY_SESSION: 'studySession',
	TODAYS_PROGRESS: 'todaysProgress'
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
	'theory', 'shortNotes', 'PYQ_Mains', 'PYQ_Advanced', // * 1st inProgress round
	'DPP1', 'mindMap', 'Module',                         // * 2nd inProgress round
	'DPP2', 'Book',                                      // * 3rd / final inProgress round
] as const;

export type ChapterCompletionTag = (typeof CHAPTER_COMPLETION_SEQUENCE)[number];

// * Mirrors chapter.model.ts's own MIN_REQUIRED_RESOURCES — kept here too
// * so the API layer can reject a "markAsUnfinished" call *before* ever
// * hitting the DB, instead of relying only on the model's own guard.
export const MIN_TAGS_FOR_FIRST_UNFINISHED = 4;