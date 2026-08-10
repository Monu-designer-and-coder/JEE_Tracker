import { getTopicResponse } from "./topicsOrganized.types";
import { GetSubjectResponse } from "./GetResponse.types";
import { eCurrentChapterStatus } from '@/types/model/chapter.model.types';

export interface getPendingChapter {
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

export interface getPendingChapterSubjectWiseList {
    _id: string;
    name: string;
    chapterList: getPendingChapter[]
}

export interface detailedListOfChaptersInSystem extends getPendingChapter {
    topicsList: getTopicResponse[];
    topicsLeft: number;
    topicsCompletedPercent: number;
    topicsLeftPercent: number;
    currentChapterStatus: eCurrentChapterStatus;
    subjectDetails: GetSubjectResponse;
}

//tasks

export interface inProgressChaptersTaskList {
    chapter: GetSubjectResponse;
    topicsToComplete: string[];
    tagsToComplete: string[];
    subjectDetails: GetSubjectResponse;
}
export interface inProgressChaptersCurrentTaskList {
    chapter: GetSubjectResponse;
    task: string;
    subjectDetails: GetSubjectResponse;
}

export interface currentTaskDetails {
    _id: string;
    task: string;
    subject: GetSubjectResponse;
    chapter: GetSubjectResponse;
    seqNumber: number;
    assignDate: Date;
}