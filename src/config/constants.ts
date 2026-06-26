
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

/**
 * * Local storage keys for data caching
 * ? Prevents magic strings and ensures consistency
 */
export const CHAPTER_COMPLETION_SEQUENCE = [
    'theory',
    'shortNotes',
    'PYQ_Mains',
    'PYQ_Advanced',
    //?-------------------------------
    'DPP1',
    'mindMap',
    'Module',
    //?-------------------------------
    'DPP2',
    'Book',
] as const;
export const TOPIC_COMPLETION_SEQUENCE = [
    'inTextQuestions',
    'inClassQuestions',
] as const;