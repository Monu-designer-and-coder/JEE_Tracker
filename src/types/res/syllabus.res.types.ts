import { iDetailedChapterResponse } from './chapter.res.types';
import { iSubjectResponse } from './subject.res.types';

export interface iSyllabusDetails extends iSubjectResponse {
	completedChapters: number;
	completedAdvancedPYQs: number;
	completedMainsPYQs: number;
	completedTheory: number;
	totalChapters: number;
	chapterList: iDetailedChapterResponse[];
}


export interface iExtendedSyllabusDetails extends iSyllabusDetails {
	percentChaptersCompleted: number;
	percentTheoryCompleted: number;
	percentPYQsSolved: number;
}

