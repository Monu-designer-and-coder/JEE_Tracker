import { GetSubjectResponse } from "./GetResponse.types";

export interface getQuestionStreakResponse {
    date: Date;
    subject: string;
    questionDone: number;
}
export interface getQuestionStreakByDateResponse {
    _id: Date;
    details: {
        _id: string;
        subject: GetSubjectResponse;
        questionDone: number;
        date: Date;
    }[]
}
export interface getQuestionStreakBySubjectResponse {
    _id: GetSubjectResponse;
    details: {
        _id: string;
        subject: GetSubjectResponse;
        questionDone: number;
        date: Date;
    }[]
}

export interface getQuestionStreakTodayResponse {
    _id: string;
    date: string;
    questionsDone: number;
    subject: GetSubjectResponse;

}