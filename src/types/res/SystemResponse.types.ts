import { currentChapterStatus } from "@/model/chapters.model";
import { getTopicResponse } from "./topicsOrganized.types";

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
    currentChapterStatus: currentChapterStatus;
}

//tasks

export interface inProgressChaptersTaskList {
    chapter: string;
    topicsToComplete: string[];
    tagsToComplete: string[];
}
export interface inProgressChaptersCurrentTaskList {
    chapter: string;
    task: string;
}