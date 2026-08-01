import { Types } from "mongoose";
import { studyTaskOptions } from "@/model/study-task.model";

// * One row returned by GET /api/study-task — a study-task enriched with
// * its subject + chapter/topic context and a few derived stats.
export interface studyTaskListItem {
  _id: Types.ObjectId;
  assignDate: Date;
  completionDate?: Date;
  done: boolean;
  subjectDetails: { _id: Types.ObjectId; name: string };
  studyTask: { enum: studyTaskOptions; _id: Types.ObjectId; tag: string };
  refDetails: { _id: Types.ObjectId; name: string; chapter:Types.ObjectId }; // * resolved chapter OR topic doc
  totalTimeSpent: number;   // * sum of workingSessions[].totalTime, in ms
  isSessionActive: boolean; // * true while a timer is currently running
  workingSessions: { start: Date; end: Date; totalTime: number }[];
}