import { getChapterResponse } from './chapterResponse.types';
import { GetSubjectResponse } from './GetResponse.types';
import { getTopicResponse } from './topicsOrganized.types';

export interface syllabusDetailedDataChapter extends getChapterResponse {
    topicsList: getTopicResponse[];
    totalTopics: number;
    totalTopicsCompleted: number;
    totalTopicsCompletedPercentage: number;
    totalTopicsTheoryCompleted: number;
    totalTopicsTheoryCompletedPercentage: number;
    currentChapterStatus?: 'pending' | 'upNext' | 'inProgress' | 'unFinished' | 'done';

}

export interface syllabusDetailedData extends GetSubjectResponse {
    completedChapters: number;
    completedAdvancedPYQs: number;
    completedMainsPYQs: number;
    completedTheory: number;
    totalChapters: number;
    chapterList: syllabusDetailedDataChapter[];
}

export interface finalResultData extends syllabusDetailedData {
    percentChaptersCompleted: number;
    percentTheoryCompleted: number;
    percentPYQsSolved: number;
}

export interface subjectsChaptersList {
    _id: string;
    name: string;
    seqNumber: number;
    subject: GetSubjectResponse;
    currentChapterStatus: 'pending' | 'upNext' | 'inProgress' | 'unFinished' | 'done';
}
