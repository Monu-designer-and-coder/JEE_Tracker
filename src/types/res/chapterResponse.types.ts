import { GetSubjectResponse } from "./GetResponse.types";

export interface getChapterResponse {
    seqNumber: number;
    name: string;
    subject: getChapterResponse;
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

export interface getSubjectWiseChapterResponse extends GetSubjectResponse {
    chapterList: {
        seqNumber: number;
        name: string;
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
    }[];
}
