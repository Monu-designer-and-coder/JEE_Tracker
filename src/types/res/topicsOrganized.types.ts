import { GetSubjectResponse } from './GetResponse.types';

export interface getTopicResponse {
    _id: string;
    name: string;
    seqNumber: number;
    done: boolean;
    theory: boolean;
    inTextQuestions: boolean;
    inClassQuestions: boolean;
}

export interface getOrganizedChapterResponse {
    _id: string;
    seqNumber: number;
    name: string;
    topicsList: getTopicResponse[];
}

export interface getOrganizedTopicResponse extends GetSubjectResponse {
    chapterList: getOrganizedChapterResponse[];
}
