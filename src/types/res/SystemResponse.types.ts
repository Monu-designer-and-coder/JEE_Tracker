
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