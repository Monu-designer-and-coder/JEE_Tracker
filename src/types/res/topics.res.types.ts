import { Types } from 'mongoose';
import { iSubjectResponse } from './subject.res.types';

export interface iTopicResponse {
	_id: Types.ObjectId | string;
	name: string;
	seqNumber: number;
	done: boolean;
	theory: boolean;
	inTextQuestions: boolean;
	inClassQuestions: boolean;
}


export interface iTopicListByChapter {
		_id: string;
		seqNumber: number;
		name: string;
		topicsList: iTopicResponse[];
}

export interface iTopicsListArrangedSubjectWise extends iSubjectResponse {
		chapterList: iTopicListByChapter[];
}