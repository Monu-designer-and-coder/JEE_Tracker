import { Document, Types } from "mongoose";


export enum eCurrentChapterStatus {
  Pending = 'pending', //? first stage
  UpNext = 'upNext', //? second stage
  InProgress = 'inProgress', //? third stage
  UnFinished = 'unFinished', //? fourth stage
  Done = 'done', //? fifth stage
}


export interface iChapterModel extends Document {
  name: string;
  subject: Types.ObjectId;
  seqNumber: number;
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
  currentChapterStatus: eCurrentChapterStatus;
}