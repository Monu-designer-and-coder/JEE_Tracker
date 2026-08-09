import { Types } from 'mongoose';
import { iChapterResponse, tChapterStatus } from './chapter.res.types';
import { iSubjectResponse } from './subject.res.types';

export interface iChapterList {
	_id: Types.ObjectId | string;
	name: string;
	seqNumber: number;
	subject: iSubjectResponse;
	currentChapterStatus: tChapterStatus;
}

export interface iSubjectWiseChapterListResponse extends iSubjectResponse {
	chapterList: iChapterResponse[];
}
