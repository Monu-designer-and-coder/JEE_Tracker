import { getTopicResponse } from './topicsOrganized.types';
import { GetSubjectResponse } from './GetResponse.types';
import { eCurrentChapterStatus } from '@/types/model/chapter.model.types';
import { Types } from 'mongoose';
import { eStudyTaskOptions } from '../model/study-task.model.types';

export interface iChapterDetailsForStudySystem {
	_id: string;
	name: string;
	seqNumber: number;
	done?: boolean;
	theory?: boolean;
	shortNotes?: boolean;
	mindMap?: boolean;
	DPP1?: boolean;
	DPP2?: boolean;
	Module?: boolean;
	PYQ_Mains?: boolean;
	PYQ_Advanced?: boolean;
	Book?: boolean;
	totalTopics?: number;
	totalTopicsCompleted?: number;
}

export interface iSubjectWiseChaptersListByChapterStatus {
	_id: string;
	name: string;
	chapterList: iChapterDetailsForStudySystem[];
}

export interface iDetailedListOfChaptersInSystem extends iChapterDetailsForStudySystem {
	topicsList: getTopicResponse[];
	topicsLeft: number;
	topicsCompletedPercent: number;
	topicsLeftPercent: number;
	currentChapterStatus: eCurrentChapterStatus;
	subjectDetails: GetSubjectResponse;
}

//tasks

export interface iInProgressChaptersTaskList {
	chapter: GetSubjectResponse;
	topicsToComplete: string[];
	tagsToComplete: string[];
	subjectDetails: GetSubjectResponse;
}
export interface iInProgressChaptersCurrentTaskList {
	chapter: GetSubjectResponse;
	task: string;
	subjectDetails: GetSubjectResponse;
}

export interface iCurrentTaskDetails {
	_id: string;
	task: string;
	subject: GetSubjectResponse;
	chapter: GetSubjectResponse;
	seqNumber: number;
	assignDate: Date;
}

//study task

export interface iStudyTaskListItem {
	_id: Types.ObjectId;
	assignDate: Date;
	completionDate?: Date;
	done: boolean;
	subjectDetails: { _id: Types.ObjectId; name: string };
	studyTask: { enum: eStudyTaskOptions; _id: Types.ObjectId; tag: string };
	refDetails: { _id: Types.ObjectId; name: string; chapter: Types.ObjectId }; // * resolved chapter OR topic doc
	totalTimeSpent: number; // * sum of workingSessions[].totalTime, in ms
	isSessionActive: boolean; // * true while a timer is currently running
	workingSessions: { start: Date; end: Date; totalTime: number }[];
}
