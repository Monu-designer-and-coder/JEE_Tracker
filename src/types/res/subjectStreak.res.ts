import { Types } from 'mongoose';
import { iSubjectResponse } from './subject.res.types';

export interface iDetailedSubjectStreakDocumentResponse {
	_id: Types.ObjectId | string;
	questionsDone: number;
	timeStudied: number;
	subject: iSubjectResponse;
}
export interface iExtendedDetailedSubjectStreakDocumentResponse extends iDetailedSubjectStreakDocumentResponse {
	date: Date;
}

export interface iDailyRecordDocument {
	_id:  string | Date;
	details: iExtendedDetailedSubjectStreakDocumentResponse[];
}

export interface iSubjectWiseRecordDocument {
	subject: iSubjectResponse;
	details: iExtendedDetailedSubjectStreakDocumentResponse[];
}

// ! --------------------------------------------------

export interface iDayDetails {
	totalQuestions: number;
	totalTime: number;
	date: Date;
}

export interface iBestOverallDay extends iDayDetails {
	averageScore: number;
}

export interface iSubjectPeakDay {
	_id: Types.ObjectId | string;
	bestDate: Date;
	peakTime: number;
	peakQuestions: number;
	peakAverageScore: number;
	subjectName: string;
}

export interface iPeakDetail {
	peakTimeStudiedDay: iDayDetails[];
	peakQuestionsDoneDay: iDayDetails[];
	bestOverallDay: iBestOverallDay[];
	subjectWisePeaks: iSubjectPeakDay[];
}

//!---------------------------------------------------

export interface iDetailedDayDetails {
	totalQuestionsDone: number;
	totalTimeStudied: number;
	date: Date;
	details: iDetailedSubjectStreakDocumentResponse[];
}

export interface iDetailedOverallBestDayDetails extends iDetailedDayDetails {
	score: number;
}

export interface iDetailedSubjectPeakDay {
	subjectName: string;
	peakDate: Date;
	peakQuestionsDone: number;
	peakTimeStudied: number;
	peakScore: number;
	subjectId: Types.ObjectId | string;
}

export interface iDetailedPeakDetail {
	dailyBreakdown: iDetailedDayDetails[];
	subjectWisePeaks: iDetailedSubjectPeakDay[];
	peakTimeStudiedDay: iDetailedDayDetails[];
	peakQuestionsDoneDay: iDetailedDayDetails[];
	bestOverallDay: iDetailedOverallBestDayDetails[];
}
