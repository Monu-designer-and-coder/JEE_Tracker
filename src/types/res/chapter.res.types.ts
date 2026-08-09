import { Types } from 'mongoose';
import { iSubjectResponse } from './subject.res.types';
import { iTopicResponse } from './topics.res.types';

export type tChapterStatus =
	| 'pending'
	| 'upNext'
	| 'inProgress'
	| 'unFinished'
	| 'done';

export interface iChapterResponse {
	_id: Types.ObjectId | string;
	seqNumber: number;
	name: string;
	subject: iSubjectResponse;
	done: boolean;
	theory: boolean;
	shortNotes: boolean;
	mindMap: boolean;
	DPP1: boolean;
	DPP2: boolean;
	Module: boolean;
	PYQ_Mains: boolean;
	PYQ_Advanced: boolean;
	Book: boolean;
}

export interface iDetailedChapterResponse extends iChapterResponse {
	topicsList: iTopicResponse[];
	totalTopics: number;
	totalTopicsCompleted: number;
	totalTopicsCompletedPercentage: number;
	totalTopicsTheoryCompleted: number;
	totalTopicsTheoryCompletedPercentage: number;
	currentChapterStatus?: tChapterStatus;
}
