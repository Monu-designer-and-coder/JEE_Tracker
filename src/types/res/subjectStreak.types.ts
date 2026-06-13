import { GetSubjectResponse } from "./GetResponse.types";

export interface getSubjectStreakResponse {
    date: Date;
    subject: string;
    questionDone: number;
    timeStudied: number;
}
export interface getSubjectStreakByDateResponse {
    _id: Date;
    details: {
        _id: string;
        subject: GetSubjectResponse;
        questionDone: number;
        timeStudied: number;
        date: Date;
    }[]
}
export interface getSubjectStreakBySubjectResponse {
    _id: GetSubjectResponse;
    details: {
        _id: string;
        subject: GetSubjectResponse;
        questionDone: number;
        timeStudied: number;
        date: Date;
    }[]
}

export interface getSubjectStreakTodayResponse {
    _id: string;
    date: string;
    questionsDone: number;
    timeStudied: number;
    subject: GetSubjectResponse;

}